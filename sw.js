const CACHE_NAME = "goals-app-cache-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  // ניווטים – תמיד להחזיר index.html מהקאש, כדי שהאפליקציה תעלה גם בלי רשת
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then(function (cachedResponse) {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).catch(function () {
          return caches.match("./index.html");
        });
      })
    );
    return;
  }

  // שאר הבקשות – קודם קאש, אם אין אז רשת
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(function () {
        return;
      });
    })
  );
});
