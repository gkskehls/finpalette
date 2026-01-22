import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

// VAPID 키 (Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates 에서 발급 필요)
// 지금은 임시로 빈 문자열로 둡니다. 실제 키를 발급받아 .env.local에 저장하고 불러와야 합니다.
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export function usePushNotification() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 초기 구독 상태 확인
    const checkSubscription = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
      }
    };

    checkSubscription();
  }, []);

  // Base64 URL-safe 문자열을 Uint8Array로 변환하는 유틸리티 함수
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    if (!user) {
      toast.error('로그인이 필요한 기능입니다.');
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.warn('VAPID Public Key가 설정되지 않았습니다.');
      toast.error('푸시 알림 설정이 완료되지 않았습니다. (VAPID Key 누락)');
      return;
    }

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      // 1. 알림 권한 요청
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('알림 권한이 거부되었습니다.');
        setLoading(false);
        return;
      }

      // 2. 푸시 서비스 구독
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setSubscription(newSubscription);
      setIsSubscribed(true);

      // 3. 서버에 구독 정보 저장
      const subscriptionJSON = newSubscription.toJSON();

      // DB 접근 가능 시 아래 주석 해제하여 사용
      /*
      // import { supabase } from '../lib/supabase'; // 상단 import 필요
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscriptionJSON.endpoint,
        p256dh: subscriptionJSON.keys?.p256dh,
        auth: subscriptionJSON.keys?.auth,
      }, { onConflict: 'user_id, endpoint' });

      if (error) {
        throw error;
      }
      */

      console.log('Push Subscription:', subscriptionJSON);
      toast.success('알림이 설정되었습니다!');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('알림 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        await existingSubscription.unsubscribe();

        // DB에서 구독 정보 삭제 (선택 사항)
        // const { error } = await supabase.from('push_subscriptions').delete().match({ endpoint: existingSubscription.endpoint });

        setSubscription(null);
        setIsSubscribed(false);
        toast.success('알림이 해제되었습니다.');
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      toast.error('알림 해제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return {
    isSubscribed,
    subscription,
    loading,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
