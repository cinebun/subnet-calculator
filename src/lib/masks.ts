export interface IMaskOption {
  label: string;
  prefix: number;
  mask: string;
}

export const maskOptions: IMaskOption[] = Array.from({ length: 33 }, (_, i) => {
  const octets = Array(4).fill(0);
  let bits = i;

  for (let j = 0; j < 4 && bits > 0; j++) {
    const bitsInOctet = Math.min(8, bits);
    octets[j] = (0xff << (8 - bitsInOctet)) & 0xff;
    bits -= bitsInOctet;
  }

  const maskStr = octets.join('.');
  return {
    label: `${i} / ${maskStr}`,
    prefix: i,
    mask: maskStr,
  };
});