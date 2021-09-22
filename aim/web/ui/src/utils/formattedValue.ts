function getFormattedValue(value: number): number {
  return Math.round(value * 10e9) / 10e9;
}

export default getFormattedValue;
