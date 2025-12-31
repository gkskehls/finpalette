import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// 이미지 리사이징 유틸리티 함수
const resizeImage = (file: File, maxWidth: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 비율 유지하며 리사이징
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width *= maxWidth / height;
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // JPEG 포맷, 퀄리티 0.7로 압축
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob conversion failed'));
        },
        'image/jpeg',
        0.7
      );
    };

    reader.readAsDataURL(file);
  });
};

export function useAvatarUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      setIsUploading(true);

      // 1. 이미지 리사이징 (최대 128px)
      // 아바타용이므로 작게 줄여서 용량을 최적화합니다.
      const resizedBlob = await resizeImage(file, 128);

      // 2. 파일 경로 생성 (users/유저ID/timestamp.jpg)
      // 리사이징 과정에서 jpeg로 변환되므로 확장자는 jpg로 고정합니다.
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      // 3. Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, resizedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 4. 업로드된 이미지의 Public URL 가져오기
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('이미지 업로드에 실패했습니다.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading };
}
