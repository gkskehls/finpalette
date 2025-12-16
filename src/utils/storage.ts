/**
 * 현재 Origin의 Local Storage 총 사용량을 바이트(byte) 단위로 계산하여 반환합니다.
 */
export function getLocalStorageUsage(): number {
  let totalBytes = 0;

  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      const value = localStorage.getItem(key);

      if (value) {
        // new Blob([text]).size는 텍스트의 정확한 byte 크기를 알려줍니다.
        const keyBytes = new Blob([key]).size;
        const valueBytes = new Blob([value]).size;
        totalBytes += keyBytes + valueBytes;
      }
    }
  }

  return totalBytes;
}

/**
 * 바이트 단위를 KB, MB 등 읽기 쉬운 형태로 변환합니다.
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Local Storage의 최대 허용 용량 (MB)
 * 브라우저마다 다르지만, 일반적으로 5MB를 기준으로 합니다.
 */
export const LOCAL_STORAGE_MAX_MB = 5;
export const LOCAL_STORAGE_MAX_BYTES = LOCAL_STORAGE_MAX_MB * 1024 * 1024;

/**
 * 로컬 스토리지 사용량 경고 임계값 (전체 용량의 80%)
 */
export const LOCAL_STORAGE_WARNING_THRESHOLD_BYTES =
  LOCAL_STORAGE_MAX_BYTES * 0.8;

/**
 * 로컬 스토리지 사용량 위험 임계값 (전체 용량의 90%)
 */
export const LOCAL_STORAGE_DANGER_THRESHOLD_BYTES =
  LOCAL_STORAGE_MAX_BYTES * 0.9;
