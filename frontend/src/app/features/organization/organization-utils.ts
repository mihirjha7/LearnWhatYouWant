/** WCAG relative-luminance contrast ratio between two #rrggbb colors. */
export function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const value = hex.replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(value)) return 0;
    const [r, g, b] = [0, 2, 4].map((offset) => {
      const channel = Number.parseInt(value.slice(offset, offset + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmails(raw: string): { valid: string[]; invalid: string[] } {
  const entries = [...new Set(raw.split(/[\s,;]+/).map((entry) => entry.trim().toLowerCase()).filter(Boolean))];
  return { valid: entries.filter((entry) => EMAIL.test(entry)), invalid: entries.filter((entry) => !EMAIL.test(entry)) };
}
