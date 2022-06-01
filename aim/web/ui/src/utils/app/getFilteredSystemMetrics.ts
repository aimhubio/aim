import { isSystemMetric } from 'utils/isSystemMetric';

/**
 * @param {string[]} array an array of strings,
 * like `['Loss_type="duration_loss"','__system__cpu']`
 * @param {boolean} isExclude exclude system metrics vise versa,
 *
 * @returns {Array} Array containing system metric keys or empty array
 * @example
 * getFilteredSystemMetrics(['Loss_type="duration_loss','__system__cpu']); // => ['__system__cpu']
 * getFilteredSystemMetrics(['Loss_type="duration_loss','__system__cpu'], true); // => ['Loss_type="duration_loss']
 */

export default function getFilteredSystemMetrics(
  array: string[],
  isExclude?: boolean,
): string[] | [] {
  let filtered: string[] = [];
  if (Array.isArray(array)) {
    array.forEach((val) => {
      if (isExclude ? !isSystemMetric(val) : isSystemMetric(val)) {
        filtered.push(val);
      }
    });
  }

  return filtered;
}
