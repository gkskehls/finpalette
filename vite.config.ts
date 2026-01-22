import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Finpalette',
        short_name: 'Finpalette',
        description: '나만의 색깔있는 가계부, 핀팔레트',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      // PWA 푸시 알림 설정을 위한 추가 옵션
      strategies: 'injectManifest', // 커스텀 서비스 워커 파일 사용
      srcDir: 'src', // 서비스 워커 파일이 위치할 디렉토리
      filename: 'sw.js', // 서비스 워커 파일 이름
      // VAPID 키 설정 (나중에 Firebase에서 발급받아 여기에 추가)
      // push: {
      //   vapidKey: 'YOUR_VAPID_PUBLIC_KEY_HERE',
      // },
      devOptions: {
        enabled: true, // 개발 환경에서 PWA 활성화
      },
      workbox: {
        clientsClaim: true, // 새 서비스 워커가 즉시 활성화되도록 함
        skipWaiting: true, // 새 서비스 워커가 이전 서비스 워커를 기다리지 않고 활성화되도록 함
      },
    }),
  ],
});
