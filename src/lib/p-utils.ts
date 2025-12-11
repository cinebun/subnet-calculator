// ТЗ: функция валидации IP
export function isIpValid(ip: string): boolean {
  return (
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(ip) &&
    ip.split('.').every((octet) => {
      const num = Number(octet);
      // Добавим проверку на NaN и отрицательные значения (ТЗ подразумевает, но не пишет явно)
      return !isNaN(num) && num >= 0 && num <= 255;
    })
  );
}

// ТЗ: функция расчёта адреса сети
export function getNetworkAddress(ip: string, mask: string): string {
  const ipOctets = ip.split('.');
  const maskOctets = mask.split('.');
  const result: number[] = [];

  for (let i = 0; i < 4; i++) {
    result.push(Number(ipOctets[i]) & Number(maskOctets[i]));
  }

  return `${result[0]}.${result[1]}.${result[2]}.${result[3]}`;
}

// ТЗ: функция расчёта количества адресов
export function getAddressesCount(mask: string): number {
  let binaryMask = '';
  for (const octet of mask.split('.')) {
    binaryMask += Number(octet).toString(2).padStart(8, '0');
  }
  // В ТЗ: `replaceAll('0','')` → остаются единицы → `zeros = 32 - ones`
  const ones = binaryMask.replaceAll('0', '').length;
  const zeros = 32 - ones;

  if (zeros === 0) return 1;
  if (zeros === 1) return 2;
  return Math.pow(2, zeros) - 2;
}