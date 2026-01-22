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
 * HSL 값을 RGB 값으로 변환합니다.
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns [r, g, b] (0-255)
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * RGB 색상의 상대적 휘도(Relative Luminance)를 계산합니다.
 * (WCAG 2.0 공식)
 */
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * 주어진 HSL 색상에 대해 최적의 대비 텍스트 색상(검은색 또는 흰색)을 반환합니다.
 * 실제 인지 휘도(Perceived Luminance)를 계산하여 결정하므로 정확도가 높습니다.
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns 'var(--text-primary)' (어두운 색) 또는 '#FFFFFF' (밝은 색)
 */
export function getContrastColorByHSL(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  const luminance = getLuminance(r, g, b);

  // 휘도 임계값 (0.0 ~ 1.0)
  // 0.5 이상이면 밝은 색으로 간주하여 검은색 텍스트 사용
  // 노란색 같은 경우 L=50%여도 휘도가 높게 나옴
  return luminance > 0.5 ? 'var(--text-primary)' : '#FFFFFF';
}

/**
 * (구버전) 단순 밝기 기반 대비 색상 계산
 * @deprecated getContrastColorByHSL을 사용하세요.
 */
export function getContrastColor(lightness: number): string {
  const LUMINANCE_THRESHOLD = 65;
  return lightness > LUMINANCE_THRESHOLD ? 'var(--text-primary)' : '#FFFFFF';
}

/**
 * 다크 모드에 적합하도록 HSL 색상을 조정합니다.
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns 조정된 HSL 값
 */
export function adjustHslForDarkMode(
  h: number,
  s: number,
  l: number
): { h: number; s: number; l: number } {
  // 다크 모드에서 채도를 낮추고 명도를 높입니다.
  const newSaturation = Math.max(0, s - 20); // 채도를 최소 0까지 감소
  const newLightness = Math.min(100, l + 20); // 명도를 최대 100까지 증가

  return {
    h: h,
    s: newSaturation,
    l: newLightness,
  };
}
