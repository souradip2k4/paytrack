/**
 * Validates hex color, strips the '#' prefix, and trims opacity.
 * Returns the raw hex string or null if invalid.
 */
export function trimColor(c: string | null | undefined): string | null {
  if (!c) return null;
  let hex = c.trim().replace(/^#/, '');
  const hexRegex = /^([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  if (!hexRegex.test(hex)) return null;
  if (hex.length === 4) hex = hex.slice(0, 3);
  else if (hex.length === 8) hex = hex.slice(0, 6);
  return hex;
}

/**
 * Takes a raw hex string and ensures it is prefixed with '#' for UI usage.
 */
export function displayColor(c: string | null | undefined): string | null {
  if (!c) return null;
  const hex = c.trim();
  if (hex === '') return null;
  return hex.startsWith('#') ? hex : `#${hex}`;
}