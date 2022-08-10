import { IRangesState } from 'modules/BaseExplorer/components/RangePanel/RangePanel.d';

/**
 * Returns the density and the slice of the range.
 *
 * @param {IRangesState} ranges The total of hte range.
 * @param {[number, number]} used The used slice of the range.
 * @return { record_range?: string, index_range?: string; record_density?: string, index_density?: string } the query of the ranges.
 */

export function getQueryFromRanges(ranges: IRangesState): {
  record_range?: string;
  index_range?: string;
  record_density?: string;
  index_density?: string;
} {
  // creating the empty query object
  const queryRanges: {
    record_range?: string;
    index_range?: string;
    record_density?: string;
    index_density?: string;
  } = {};
  // checking if the record slice is exist
  if (ranges?.record?.slice) {
    // setting the record range and density in query ranges object
    const slice = ranges.record.slice;
    queryRanges.record_range = `${slice[0]}:${slice[1] + 1}`;
    queryRanges.record_density = `${ranges.record?.density}` ?? '50';
  }
  // checking if the index slice is exist
  if (ranges?.index?.slice) {
    // setting the index range and density in query ranges object
    const slice = ranges.index.slice;
    queryRanges.index_range = `${slice[0]}:${slice[1] + 1}`;
    queryRanges.index_density = `${ranges.index?.density}` ?? '5';
  }

  return queryRanges;
}
