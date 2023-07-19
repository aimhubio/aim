import {
  GroupedSequence,
  RecordRanges,
} from 'types/core/AimObjects/GroupedSequences';
import { SequenceType } from 'types/core/enums';

import { IQueryableData } from './types';

function getTotalRange(groupedSeqs: GroupedSequence[]): [number, number] {
  const total: [number, number] = [0, 0];
  for (const groupedSeq of groupedSeqs) {
    if (groupedSeq?.sequences) {
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
  }
  return [total[0], total[1]];
}

function collectQueryableData(
  groupedSeqs: GroupedSequence[],
  sequenceType: SequenceType,
): IQueryableData {
  let queryable_data: { ranges?: RecordRanges } = {};

  if (sequenceType === SequenceType.Metric) {
    return queryable_data;
  }
  if (groupedSeqs) {
    const total = getTotalRange(groupedSeqs);

    queryable_data = {
      ranges: {
        record_range_total: total,
        record_range_used: [
          groupedSeqs?.[0]?.sequences?.[0]?.range?.[0] || 0,
          groupedSeqs?.[0]?.sequences?.[0]?.range?.[1] || 0,
        ],
      },
    };
  }

  return queryable_data;
}

export default collectQueryableData;
