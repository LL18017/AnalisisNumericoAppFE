// Nombre del caché
const CACHE_NAME = "mi-app-cache-v1";

// Archivos a cachear
const urlsToCache = [
    "../",
    "../index.html",
    "../styles.css",
    "../app.js",
    "../manifest.json",
    "../assets/icon-512.png"
];

// Instalación del service worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Activación (limpia versiones antiguas)
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
        )
    );
});

// Interceptar solicitudes y servir desde caché
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
