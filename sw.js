const CACHE = 'movement-studio-v3';
const FILES = ['./', './index.html', './style.css', './blueprint.css', './app.js', './blueprint.js', './manifest.webmanifest', './icon.svg', './gym/coach.mjs'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE).map(key => caches.delete(key))
  )));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(async response => {
    if (response.ok) {
      await (await caches.open(CACHE)).put(event.request, response.clone());
    }
    return response;
  }).catch(() => caches.match(event.request)));
});
