// 서비스 워커: 한 번 열면 인터넷 없이도 앱이 열리도록 파일을 저장해 둡니다.
const CACHE = 'mybook-v1';
const FILES = ['./', 'index.html', 'jszip.min.js', 'manifest.webmanifest', 'icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// 인터넷이 되면 최신 파일, 안 되면 저장해 둔 파일 사용
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; })
    .catch(() => caches.match(e.request)));
});
