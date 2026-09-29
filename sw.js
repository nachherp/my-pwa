const CACHE_NAME = 'notas-pwa-v3';

// Archivos estáticos clave que se guardarán para que la app cargue offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon1.png',
  './icon2.png'
];

// 1. Evento INSTALL: Se descargan y guardan los recursos en Caché Storage
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precargando archivos en caché');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Evento ACTIVATE: Limpieza de versiones viejas de caché
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando nueva versión...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Borrando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Evento FETCH: Intercepta cada solicitud de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si el recurso ya está en caché, devuélvelo de inmediato (modo offline)
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si no está en caché, búscalo en internet
      return fetch(event.request).catch(() => {
        console.log('[SW] Petición fallida (sin conexión)');
      });
    })
  );
});