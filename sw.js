/* 電波がなくても使えるようにするしくみ。ファイルを直したら VERSION を上げる */
const VERSION = "2026-11-16d";
const CACHE = "rikasansu-" + VERSION;
const SHELL = ["./", "index.html", "manifest.webmanifest", "css/common.css", "js/common.js",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "moon/", "moon/index.html", "shadow/", "shadow/index.html",
  "teko/", "teko/index.html", "denki/", "denki/index.html",
  "rittai/", "rittai/index.html", "ten/", "ten/index.html"];
// 3D図の部品（three.js r128）とフォント：最初に電波のある所で開いたときに保存する
const LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js",
  "https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=Zen+Maru+Gothic:wght@700;900&display=swap"
];
const LIB_CACHE = "rikasansu-libs-1";   // 部品は版が固定なので、アプリを直しても消さない

self.addEventListener("install", (e) => {
  e.waitUntil(Promise.all([
    caches.open(CACHE).then((c) => c.addAll(SHELL)),
    caches.open(LIB_CACHE).then((c) => Promise.all(LIBS.map((u) =>
      c.match(u).then((hit) => hit || fetch(u, { mode: "no-cors" }).then((res) => c.put(u, res)).catch(() => {})))))
  ]));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((k) => k.startsWith("rikasansu-") && k !== CACHE && k !== LIB_CACHE)
    .map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("message", (e) => { if (e.data === "skip") self.skipWaiting(); });
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // 自分のファイル：保存したものを使う（新しい版は VERSION を上げて届ける）
    e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
  } else if (/(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) {
    // 3D図の部品・フォント：保存したものを先に使い、なければ取りに行って保存する
    e.respondWith(caches.open(LIB_CACHE).then((c) => c.match(req, { ignoreVary: true }).then((hit) => hit ||
      fetch(req).then((res) => { if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone()); return res; }))));
  }
});
