// check the last digit of an EAN-13, EAN-8 or UPC-A barcode
export function hasValidCheckDigit(code: string): boolean {
  if (!/^\d+$/.test(code) || ![8, 12, 13].includes(code.length)) {
    return false;
  }
  const digits = code.split('').map(Number);
  const checkDigit = digits.pop()!;
  let sum = 0;
  digits.reverse().forEach((digit, i) => {
    sum += i % 2 === 0 ? digit * 3 : digit;
  });
  return (10 - (sum % 10)) % 10 === checkDigit;
}
