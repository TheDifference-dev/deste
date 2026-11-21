/* deste: çevrimdışı kabuk. Sayfalar ağdan, yoksa önbellekten; görseller önbellekten. Veritabanı istekleri önbelleğe alınmaz. */
const SURUM = "deste-v1";
const KABUK = ["./", "index.html", "css/site.css", "js/ayar.js", "js/vendor/supabase.js", "js/veri.js", "js/slab.js", "js/ana.js", "js/uygulama.js", "img/gren.png", "img/kart-arka.webp"];
self.addEventListener("install", e => e.waitUntil(caches.open(SURUM).then(c => c.addAll(KABUK)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SURUM).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (/\.(webp|png|svg)$/.test(u.pathname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const k = res.clone(); caches.open(SURUM).then(c => c.put(e.request, k)); return res; })));
    return;
  }
  e.respondWith(fetch(e.request).then(res => { const k = res.clone(); caches.open(SURUM).then(c => c.put(e.request, k)); return res; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
