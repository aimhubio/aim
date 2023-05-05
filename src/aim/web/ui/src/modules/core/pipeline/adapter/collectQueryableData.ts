import {
  IndexRanges,
  RecordRanges,
  RunSearchRunView,
} from 'types/core/AimObjects';

import { IQueryableData } from './types';

function collectQueryableData(run: RunSearchRunView): IQueryableData {
  let queryable_data: {
    ranges?: RecordRanges & IndexRanges;
  } = {};

  if (run && run.ranges) {
    queryable_data = {
      ranges: {
        // Those changes are made since python has a mathematical interval for ranges [start, end)
        record_range_total: [
          run.ranges.record_range_total?.[0] ?? 0,
          (run.ranges.record_range_total?.[1] || 0) - 1,
        ],
        record_range_used: [
          run.ranges.record_range_used?.[0] ?? 0,
          (run.ranges.record_range_used?.[1] || 0) - 1,
        ],
      },
    };

    /**
     * If the run has index ranges, we need to have IndexRanges on queryable_data object
     *  otherwise the queryable_data object should have only RecordRanges, since this if statement ensures that it has RecordRanges
     */
    if (run.ranges.index_range_used && run.ranges.index_range_used.length) {
      queryable_data.ranges = {
        ...queryable_data.ranges,
        index_range_total: [
          run.ranges.index_range_total?.[0] ?? 0,
          (run.ranges.index_range_total?.[1] || 0) - 1,
        ],
        index_range_used: [
          run.ranges.index_range_used?.[0],
          (run.ranges.index_range_used?.[1] || 0) - 1,
        ],
      };
    }
  }

  return queryable_data;
}

export default collectQueryableData;
