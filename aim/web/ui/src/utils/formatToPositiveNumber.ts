export function formatToPositiveNumber(value: number): string {
  const formattedToString = `${value}`;
  if (value <= 0) {
    return '0';
  } else if (+formattedToString[0] === 0 && formattedToString.length > 1) {
    return formattedToString.slice(1, formattedToString.length - 1);
  }
  return formattedToString;
}
