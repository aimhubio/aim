export function removeOutliers(values: number[], t = 2): number[] {
  let filtered: number[] = [...values].sort((a: number, b: number) => a - b);

  while (true) {
    const first = filtered[0];
    const last = filtered[filtered.length - 1];
    if (!filtered.length || first === last) {
      break;
    }
    const q1: number = filtered[Math.floor(filtered.length / 4)];
    const q3: number = filtered[Math.ceil(filtered.length * (3 / 4))];
    const iqr = q3 - q1; // Inter-quartile range
    const mean = filtered.reduce((pv, cv) => pv + cv, 0) / filtered.length;
    const furthest = mean - first > last - mean ? first : last;
    if (Math.abs(furthest - mean) > t * iqr) {
      filtered = filtered.filter((elem: number) => elem !== furthest);
    } else {
      break;
    }
  }

  return filtered;
}
