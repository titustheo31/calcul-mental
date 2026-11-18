// Garde les jeux sur le téléphone pour qu'ils marchent sans internet.
// Changer VERSION à chaque modification des jeux pour que l'iPhone récupère la nouvelle version.
const VERSION = "v1";
const CACHE = "calcul-mental-" + VERSION;
const FILES = [
  "./", "./index.html",
  "./premiers/", "./premiers/index.html",
  "./carres/", "./carres/index.html",
  "./cubes/", "./cubes/index.html",
  "./lettres/", "./lettres/index.html",
  "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("calcul-mental-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réponse immédiate depuis le téléphone, mise à jour en arrière-plan quand il y a du réseau
// (les polices Google sont gardées au passage).
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
