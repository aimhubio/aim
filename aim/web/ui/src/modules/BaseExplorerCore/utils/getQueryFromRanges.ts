import { IRangesState } from 'modules/BaseExplorer/components/RangePanel/RangePanel.d';

export function getQueryFromRanges(ranges: IRangesState): {
  record_range?: string;
  index_range?: string;
  record_density?: string;
  index_density?: string;
} {
  const queryRanges: {
    record_range?: string;
    index_range?: string;
    record_density?: string;
    index_density?: string;
  } = {};
  if (ranges?.record?.slice) {
    const slice = ranges.record.slice;
    queryRanges.record_range = `${slice[0]}:${slice[1] + 1}`;
    queryRanges.record_density = `${ranges.record?.density}` ?? '50';
  }
  if (ranges?.index?.slice) {
    const slice = ranges.index.slice;
    queryRanges.index_range = `${slice[0]}:${slice[1] + 1}`;
    queryRanges.index_density = `${ranges.index?.density}` ?? '5';
  }
  return queryRanges;
}
