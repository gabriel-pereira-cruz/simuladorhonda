/**
 * Pseudo-aleatório estável em [0, 1): mesma entrada → mesma saída (adequado a mocks sem backend).
 */
export function stable01(...parts: (string | number)[]): number {
  const s = parts.join("|");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const x = Math.sin(h) * 10000;
  return x - Math.floor(x);
}
