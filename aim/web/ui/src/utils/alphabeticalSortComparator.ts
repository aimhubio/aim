/**
 * alphabeticalSortComparator options
 */
type Options = {
  /**
   * the key get the value from the object
   */
  orderBy: string;
  /**
   * increasing or decreasing
   */
  order?: 'asc' | 'desc';
  /**
   * once you need an additional case, i.e. you have a pref.
   *  string which need to always be at the beginning of the list
   */
  additionalCompare?: (str1: string, str2: string) => 1 | -1 | 0 | null;
};

/**
 * alphabeticalSortComparator
 * @Closure return actual compare function to pass to Array.sort asa parameter
 * @param {Options} options - options
 */
function alphabeticalSortComparator<T extends Record<string, any>>(
  options: Options,
): (a: T, b: T) => number {
  const { orderBy, order = 'asc' } = options;
  return (a: T, b: T) => {
    const str1 = a[orderBy].toUpperCase();
    const str2 = b[orderBy].toUpperCase();

    if (options.additionalCompare) {
      const result = options.additionalCompare(str1, str2);
      if (result !== null) {
        // return the result based on additional compare logic, and don't continue the base logic
        return result;
      }
      // otherwise continue the base logic
    }

    if (str1 < str2) {
      return order === 'asc' ? -1 : 1;
    }
    if (str1 > str2) {
      return order === 'asc' ? 1 : -1;
    }

    return 0;
  };
}

export default alphabeticalSortComparator;
