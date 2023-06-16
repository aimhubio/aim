import { IRangesState } from 'modules/BaseExplorer/components/RangePanel';

/**
 * Returns the density and the slice of the range.
 *
 * @param {IRangesState} ranges The total of the range.
 */

export function getQueryFromRanges(ranges: IRangesState): {
  start?: string;
  stop?: string;
  p?: number;
} {
  // creating the empty query object
  const queryRanges: {
    start?: string;
    stop?: string;
    p?: number;
  } = {};
  // check for record slice existence
  if (ranges?.record?.slice) {
    // setting the record range and density in query ranges object
    const slice = ranges.record.slice;
    const start = slice[0];
    /**
      [start, stop), to include slice[1] in the query we need to add 1 to it,
      since in python the stop is not included in the range
     */
    const stop = slice[1] + 1;

    queryRanges.start = `${start}`;
    queryRanges.stop = `${stop}`;
    queryRanges.p = ranges.record?.density ?? 50;
  }

  return queryRanges;
}
