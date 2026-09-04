const CACHE_NAME = "b1-trainer-v44";
const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Strategie: Netzwerk zuerst (frische Prüfungsvarianten, Wikipedia-Bilder, Supabase-Sync),
// bei fehlendem Internet zurück auf den Cache -> App bleibt offline nutzbar.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Externe Aufrufe (Supabase, Wikipedia, Sprachausgabe) nicht cachen, nur durchreichen
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
