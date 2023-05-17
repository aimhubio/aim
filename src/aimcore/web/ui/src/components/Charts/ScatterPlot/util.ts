import { max } from 'd3';

type NumberValue = number | { valueOf(): number };

/**
 * getMinValue, using d3.min()
 * @param {Iterable<Array<NumberValue>>} data - chart dataset
 * @param {Number} index - the index of column
 * @return - the max value of data set
 */
export const getMaxValue = (
  data: Iterable<Array<NumberValue>>,
  index: number,
): NumberValue | undefined => {
  return max(data, (d) => d[index]);
};
