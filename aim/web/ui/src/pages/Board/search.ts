import { createSearchRunsRequest } from 'modules/core/api/runsApi';
import {
  DecodingError,
  FetchingError,
} from 'modules/core/pipeline/query/QueryError';
import AdapterError from 'modules/core/pipeline/adapter/AdapterError';
import processor from 'modules/core/pipeline/adapter/processor';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import { RunSearchRunView } from 'types/core/AimObjects';

import { parseStream } from 'utils/encoder/streamEncoding';
import { AlignmentOptionsEnum } from 'utils/d3';
import { filterMetricsData } from 'utils/app/filterMetricData';

const searchRequests = {
  [SequenceTypesEnum.Metric]: createSearchRunsRequest(SequenceTypesEnum.Metric),
  [SequenceTypesEnum.Images]: createSearchRunsRequest(SequenceTypesEnum.Images),
  [SequenceTypesEnum.Audios]: createSearchRunsRequest(SequenceTypesEnum.Audios),
  [SequenceTypesEnum.Figures]: createSearchRunsRequest(
    SequenceTypesEnum.Figures,
  ),
  [SequenceTypesEnum.Texts]: createSearchRunsRequest(SequenceTypesEnum.Texts),
  [SequenceTypesEnum.Distributions]: createSearchRunsRequest(
    SequenceTypesEnum.Distributions,
  ),
};

const objectDepths = {
  [SequenceTypesEnum.Metric]: AimObjectDepths.Sequence,
  [SequenceTypesEnum.Images]: AimObjectDepths.Index,
  [SequenceTypesEnum.Audios]: AimObjectDepths.Index,
  [SequenceTypesEnum.Figures]: AimObjectDepths.Step,
  [SequenceTypesEnum.Texts]: AimObjectDepths.Index,
  [SequenceTypesEnum.Distributions]: AimObjectDepths.Index,
};

export async function search(sequenceName: SequenceTypesEnum, query: string) {
  let data: ReadableStream;
  try {
    data = (await searchRequests[sequenceName].call({
      q: query,
      report_progress: false,
    })) as ReadableStream; // @TODO write better code to avoid null check
  } catch (err: any) {
    throw new FetchingError(err.message || err, err.detail);
  }

  try {
    const runs = await parseStream<Array<RunSearchRunView>>(data);

    try {
      let result;
      let { objectList } = processor(
        runs,
        sequenceName,
        objectDepths[sequenceName],
      );

      if (sequenceName === SequenceTypesEnum.Metric) {
        result = objectList.map((item: any) => {
          const { values, steps, epochs, timestamps } = filterMetricsData(
            item.data,
            AlignmentOptionsEnum.STEP,
          );
          return {
            ...item.data,
            values: [...values],
            steps: [...steps],
            epochs: [...epochs],
            timestamps: [...timestamps],
            run: item.run,
            sequence: item.sequence,
          };
        });
      } else {
        result = objectList;
      }

      return result;
    } catch (err: any) {
      throw new AdapterError(err.message || err, err.detail);
    }
  } catch (err: any) {
    throw new DecodingError(err.message || err, err.detail);
  }
}
