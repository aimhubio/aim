import { createFetchDataRequest } from 'modules/core/api/dataFetchApi';
import {
  DecodingError,
  FetchingError,
} from 'modules/core/pipeline/query/QueryError';
import AdapterError from 'modules/core/pipeline/adapter/AdapterError';
import processor from 'modules/core/pipeline/adapter/processor';

import pyodideEngine from 'services/pyodide/store';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import { RunSearchRunView } from 'types/core/AimObjects';

import { parseStream } from 'utils/encoder/streamEncoding';
import { AlignmentOptionsEnum } from 'utils/d3';
import { filterMetricsData } from 'utils/app/filterMetricData';

const seachRequests = createFetchDataRequest();

const objectDepths: any = {
  [SequenceTypesEnum.Metric]: AimObjectDepths.Sequence,
  [SequenceTypesEnum.Images]: AimObjectDepths.Index,
  [SequenceTypesEnum.Audios]: AimObjectDepths.Index,
  [SequenceTypesEnum.Figures]: AimObjectDepths.Step,
  [SequenceTypesEnum.Texts]: AimObjectDepths.Index,
  [SequenceTypesEnum.Distributions]: AimObjectDepths.Index,
};

const queryResultCacheMap: Record<string, any> = {};

export function search(
  boardId: string,
  sequenceName: SequenceTypesEnum,
  query: string,
) {
  const queryKey = `${sequenceName}_${query}`;

  if (queryResultCacheMap.hasOwnProperty(queryKey)) {
    return queryResultCacheMap[queryKey];
  }

  const lowerCasedSequenceName = sequenceName.toLowerCase();

  seachRequests
    .call({
      q: query,
      type_: sequenceName,
      report_progress: false,
    })
    .then((data) => {
      parseStream<Array<RunSearchRunView>>(data)
        .then((runs) => {
          try {
            let result;
            let { objectList } = processor(
              runs,
              lowerCasedSequenceName as SequenceTypesEnum,
              objectDepths[lowerCasedSequenceName],
            );

            if (lowerCasedSequenceName === SequenceTypesEnum.Metric) {
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

            queryResultCacheMap[queryKey] = result;

            pyodideEngine.events.fire(
              boardId as string,
              {
                query: queryKey,
              },
              { savePayload: false },
            );
          } catch (err: any) {
            throw new AdapterError(err.message || err, err.detail);
          }
        })
        .catch((err: any) => {
          throw new DecodingError(err.message || err, err.detail);
        });
    })
    .catch((err: any) => {
      throw new FetchingError(err.message || err, err.detail);
    });

  throw 'WAIT_FOR_QUERY_RESULT';
}
