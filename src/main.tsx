import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, useNetworkStatus } from "./utils/registerSW";

// Registra o Service Worker para funcionalidade PWA
registerServiceWorker();

// Monitora status de rede (online/offline)
useNetworkStatus();

createRoot(document.getElementById("root")!).render(<App />);
