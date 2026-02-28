// Produce a short deterministic code for a guest name using FNV-1a 32-bit
// then encode in base62 to keep it short (6-7 chars).
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h >>> 0, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function toBase62(num: number): string {
  if (num === 0) return '0';
  let s = '';
  while (num > 0) {
    s = BASE62[num % 62] + s;
    num = Math.floor(num / 62);
  }
  return s;
}

export function encodeGuestName(name: string): string {
  const n = fnv1a32(name.trim().toLowerCase());
  // produce 6 chars by taking lower 36 bits? with 32-bit we get up to ~6 chars
  const code = toBase62(n);
  // pad to 6 chars for uniform length (optional)
  return code.padStart(6, '0');
}

