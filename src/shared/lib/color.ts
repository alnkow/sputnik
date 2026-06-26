/** Тёмный и светлый цвет текста для подбора по контрасту с фоном. */
const DARK_TEXT = '#1e293b';
const LIGHT_TEXT = '#ffffff';
const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_RE.test(value);
}

export function normalizeHexColor(value: unknown, fallback: string): string {
  return isHexColor(value) ? value : fallback;
}

function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Относительная яркость по WCAG для подбора читаемого цвета текста на цветном фоне. */
function relativeLuminance(hex: string): number {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Возвращает тёмный или белый цвет текста — какой из них читаемее на заданном фоне. */
export function getReadableTextColor(backgroundColor: string): string {
  if (!isHexColor(backgroundColor)) return DARK_TEXT;
  return relativeLuminance(backgroundColor) > 0.55 ? DARK_TEXT : LIGHT_TEXT;
}
