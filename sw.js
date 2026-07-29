// Service Worker - 自动更新缓存策略
const CACHE_NAME = 'restaurant-pos-v2.6';
const APP_URL = './';

// 安装时立即跳过等待
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

// 激活时立即接管
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 网络优先策略：每次都先尝试从服务器获取最新版本
// 如果网络失败，才用缓存
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(function(response) {
      // 成功从服务器获取，更新缓存
      if (response.ok) {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function() {
      // 网络失败，用缓存
      return caches.match(event.request);
    })
  );
});
