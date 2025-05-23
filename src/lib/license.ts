function getRandom14(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateUniqueKey(mac: string): string {
  const cleanMac = mac.replace(/-/g, '').toUpperCase();
  if (cleanMac.length !== 12) {
    throw new Error('Invalid MAC address format. Should be 12 hex characters.');
  }

  const keyParts: string[] = [];
  keyParts.push(getRandom14());

  for (const c of cleanMac) {
    keyParts.push(c);
    keyParts.push(getRandom14());
  }

  return keyParts.join('');
}
