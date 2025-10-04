// Service Worker para PWA - Plantando o Futuro
// Versão: 1.0.0

const CACHE_NAME = 'plantando-futuro-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';
const IMAGE_CACHE = 'image-cache-v1';

// Assets críticos para funcionar offline
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt'
];

// Rotas importantes do app
const APP_ROUTES = [
  '/',
  '/login',
  '/registration',
  '/tutorial',
  '/select-country',
  '/game-map',
  '/results'
];

// ========== INSTALL EVENT ==========
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching critical assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting...');
        return self.skipWaiting();
      })
  );
});

// ========== ACTIVATE EVENT ==========
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remove caches antigos
              return cacheName !== CACHE_NAME && 
                     cacheName !== RUNTIME_CACHE && 
                     cacheName !== IMAGE_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// ========== FETCH EVENT ==========
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requests para domínios externos (exceto APIs conhecidas)
  if (url.origin !== location.origin && !url.origin.includes('supabase.co')) {
    return;
  }

  // Estratégia para Supabase API - Network First com timeout
  if (url.origin.includes('supabase.co')) {
    event.respondWith(networkFirstWithTimeout(request, 3000));
    return;
  }

  // Estratégia para imagens - Cache First
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Estratégia para assets estáticos (CSS, JS, fonts) - Cache First
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    return;
  }

  // Estratégia para páginas HTML - Network First
  if (
    request.destination === 'document' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Fallback: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ========== CACHE STRATEGIES ==========

// Network First - tenta rede primeiro, depois cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Plantando o Futuro</title>
        <style>
          body {
            font-family: 'Press Start 2P', monospace;
            background: linear-gradient(135deg, #2C5530 0%, #1a3a1f 100%);
            color: #E8F5E9;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          .offline-container {
            max-width: 400px;
          }
          h1 {
            font-size: 1.2rem;
            margin-bottom: 20px;
            color: #81C784;
          }
          p {
            font-size: 0.7rem;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .icon {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          button {
            background: #4A7C4E;
            color: #E8F5E9;
            border: 3px solid #81C784;
            padding: 12px 24px;
            font-family: 'Press Start 2P', monospace;
            font-size: 0.6rem;
            cursor: pointer;
            transition: all 0.3s;
          }
          button:hover {
            background: #81C784;
            color: #2C5530;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="icon">🌾</div>
          <h1>Você está offline</h1>
          <p>Sem conexão com a internet. Algumas funcionalidades podem estar limitadas.</p>
          <button onclick="window.location.reload()">Tentar Novamente</button>
        </div>
      </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
}

// Network First com timeout
async function networkFirstWithTimeout(request, timeout = 3000) {
  try {
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    );

    const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network timeout or failed, trying cache');
    const cachedResponse = await caches.match(request);
    return cachedResponse || fetch(request);
  }
}

// Cache First - usa cache primeiro, depois rede
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache and network failed:', error);
    throw error;
  }
}

// Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(RUNTIME_CACHE);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// ========== MESSAGES ==========
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded successfully! 🌾');
