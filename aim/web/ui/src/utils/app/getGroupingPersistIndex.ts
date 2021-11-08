import { IGetGroupingPersistIndex } from 'types/services/models/metrics/metricsAppModel';

import { encode } from '../encoder/encoder';

export function getGroupingPersistIndex({
  groupConfig,
  grouping,
  groupName,
}: IGetGroupingPersistIndex) {
  const configHash = encode(groupConfig as {}, true);
  let index = BigInt(0);
  if (grouping?.hasOwnProperty('seed')) {
    for (let i = 0; i < configHash.length; i++) {
      const charCode = configHash.charCodeAt(i);
      if (charCode > 47 && charCode < 58) {
        index += BigInt(
          (charCode - 48) *
            Math.ceil(Math.pow(16, i) / grouping.seed[groupName]),
        );
      } else if (charCode > 96 && charCode < 103) {
        index += BigInt(
          (charCode - 87) * Math.ceil(Math.pow(16, i) / grouping.seed.color),
        );
      }
    }
  }
  return index;
}
