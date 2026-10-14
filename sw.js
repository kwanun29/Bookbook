// 서비스 워커: 한 번 열면 인터넷 없이도 앱이 열리도록 파일을 저장해 둡니다.
const CACHE = 'mybook-v4';
const FILES = ['./', 'index.html', 'jszip.min.js', 'pdf.min.js', 'pdf.worker.min.js', 'manifest.webmanifest', 'icon.png', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// 인터넷이 되면 항상 서버의 최신 파일(브라우저 임시 저장 무시), 안 되면 저장해 둔 파일 사용
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const same = new URL(r.url).origin === self.location.origin;
  const net = same ? fetch(r.url, { cache: 'no-cache' }) : fetch(r);
  e.respondWith(net.then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); } return res; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
});
