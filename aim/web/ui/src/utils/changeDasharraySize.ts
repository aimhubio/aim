function changeDasharraySize(
  dasharray: string = 'none',
  multiplier: number = 1,
): string {
  if (dasharray === 'none') return dasharray;

  return dasharray
    .split(' ')
    .map((elem) => parseInt(elem) * multiplier)
    .join(' ');
}

export default changeDasharraySize;
