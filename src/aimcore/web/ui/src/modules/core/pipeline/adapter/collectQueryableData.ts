import { RecordRanges } from 'types/core/AimObjects';
import { GroupedSequence } from 'types/core/AimObjects/GroupedSequences';

import { IQueryableData } from './types';

function getTotalRange(groupedSeqs: GroupedSequence[]): [number, number] {
  const total: [number, number] = [0, 0];
  for (const groupedSeq of groupedSeqs) {
    for (const sequence of groupedSeq.sequences) {
      if (sequence.range) {
        const [min = 0, max = 0] = sequence.range;
        if (total[0] > min) {
          total[0] = min;
        }
        if (total[1] < max) {
          total[1] = max;
        }
      }
    }
  }
  return [total[0], total[1] - 1];
}

function collectQueryableData(groupedSeqs: GroupedSequence[]): IQueryableData {
  let queryable_data: { ranges?: RecordRanges } = {};

  const total = getTotalRange(groupedSeqs);

  if (groupedSeqs) {
    queryable_data = {
      ranges: {
        record_range_total: total,
        record_range_used: [
          groupedSeqs?.[0].sequences?.[0].range?.[0] || 0,
          (groupedSeqs?.[0].sequences?.[0].range?.[1] || 1) - 1,
        ],
      },
    };
  }

  return queryable_data;
}

export default collectQueryableData;
