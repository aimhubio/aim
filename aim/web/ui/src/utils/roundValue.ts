/**
 * [Round Value]
 *
 * The method used instead of toFixed (toFixed - returns string type)
 *
 * Usage: getRoundedValue(number, digits)
 *
 * @param {number} value the number which needs to be rounded,
 * @param {number} digits the number of digits to appear after the decimal point,
 * @returns {number} - formatted number
 */
function getRoundedValue(value: number, digits: number = 10): number {
  let roundBy = 10 ** digits;
  return Math.round(value * roundBy) / roundBy;
}

export default getRoundedValue;
