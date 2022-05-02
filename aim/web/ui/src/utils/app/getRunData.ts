import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';

import {
  decodePathsVals,
  decodeBufferPairs,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';

export default async function getRunData<
  S extends ReadableStream<IRun<IMetricTrace | IParamTrace>[]>,
>(stream: S) {
  let bufferPairs = decodeBufferPairs(stream);
  let decodedPairs = decodePathsVals(bufferPairs);
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
