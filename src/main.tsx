import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Desativa Service Worker e limpa cache para evitar versões antigas durante desenvolvimento
if ('serviceWorker' in navigator) {
  const alreadyUnreg = sessionStorage.getItem('sw_unreg_done');
  if (!alreadyUnreg) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      sessionStorage.setItem('sw_unreg_done', '1');
      // Recarrega página uma vez para pegar os bundles mais recentes
      window.location.reload();
    });
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
