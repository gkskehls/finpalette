import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// Workbox 설정
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
self.skipWaiting();
clientsClaim();

// 푸시 알림 수신 이벤트 리스너
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    const title = data.title || 'Finpalette 알림';
    const options = {
      body: data.body || '새로운 알림이 도착했습니다.',
      icon: '/icon.svg', // 앱 아이콘 경로
      badge: '/icon.svg', // 안드로이드 상태바 아이콘 (작은 아이콘)
      data: {
        url: data.url || '/', // 알림 클릭 시 이동할 URL
      },
      vibrate: [100, 50, 100], // 진동 패턴
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error('Error parsing push data:', e);
    // JSON 파싱 실패 시 텍스트로 처리
    const title = 'Finpalette 알림';
    const options = {
      body: event.data.text(),
      icon: '/icon.svg',
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// 알림 클릭 이벤트 리스너
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // 알림 닫기

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // 이미 열려있는 창이 있는지 확인
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // 열려있는 창이 없으면 새 창 열기
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});
