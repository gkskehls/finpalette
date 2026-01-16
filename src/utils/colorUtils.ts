/**
 * HEX 색상 코드를 HSL(Hue, Saturation, Lightness) 객체로 변환합니다.
 * @param hex - #RRGGBB 형식의 HEX 색상 코드
 * @returns {h: number, s: number, l: number} HSL 값 (h: 0-360, s: 0-100, l: 0-100)
 */
export function hexToHsl(
  hex: string
): { h: number; s: number; l: number } | null {
  if (!hex || hex.length < 4) {
    return null;
  }

  // HEX 코드 정규화 (#RGB -> #RRGGBB)
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  ((r /= 255), (g /= 255), (b /= 255));
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // 회색
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * 주어진 밝기(lightness) 값에 따라 최적의 대비 텍스트 색상(검은색 또는 흰색)을 반환합니다.
 * @param lightness - HSL 색상 모델의 밝기 값 (0-100)
 * @returns 'var(--text-primary)' (어두운 색) 또는 '#FFFFFF' (밝은 색)
 */
export function getContrastColor(lightness: number): string {
  // 밝기 임계값. 이 값보다 밝으면 어두운 텍스트, 어두우면 밝은 텍스트를 사용합니다.
  // 65 정도로 설정하면 대부분의 색상에 대해 좋은 가독성을 제공합니다.
  const LUMINANCE_THRESHOLD = 65;

  return lightness > LUMINANCE_THRESHOLD
    ? 'var(--text-primary)' // 배경이 밝으므로 어두운 텍스트
    : '#FFFFFF'; // 배경이 어두우므로 밝은 텍스트
}
