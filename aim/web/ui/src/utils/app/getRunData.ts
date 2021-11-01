import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';

import {
  adjustable_reader,
  decodePathsVals,
  decode_buffer_pairs,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';

export default async function getRunData<
  S extends ReadableStream<IRun<IMetricTrace | IParamTrace>[]>,
>(stream: S) {
  let gen = adjustable_reader(stream);
  let buffer_pairs = decode_buffer_pairs(gen);
  let decodedPairs = decodePathsVals(buffer_pairs);
  let objects = iterFoldTree(decodedPairs, 1);

  const runData = [];
  for await (let [keys, val] of objects) {
    runData.push({
      ...(val as any),
      hash: keys[0],
    });
  }
  return runData;
}
