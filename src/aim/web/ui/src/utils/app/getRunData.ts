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

import { IRequestProgress } from './setRequestProgress';

export default async function getRunData<
  S extends ReadableStream<IRun<IMetricTrace | IParamTrace>[]>,
>(stream: S, setProgress?: (progress: IRequestProgress) => void) {
  let bufferPairs = decodeBufferPairs(stream);
  let decodedPairs = decodePathsVals(bufferPairs);
  let objects = iterFoldTree(decodedPairs, 1);

  const runData = [];

  for await (let [keys, val] of objects) {
    const data = { ...(val as any), hash: keys[0] };
    if (data.hash.startsWith('progress')) {
      const { 0: checked, 1: trackedRuns } = data;
      setProgress?.({
        matched: runData.length,
        checked,
        trackedRuns,
      });
    } else {
      runData.push(data);
    }
  }

  return runData;
}
