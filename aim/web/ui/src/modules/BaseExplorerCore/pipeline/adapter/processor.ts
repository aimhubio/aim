import _ from 'lodash';

import {
  IndexRanges,
  RecordRanges,
  RunSearchRunView,
} from 'types/core/AimObjects';
import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import { Context } from 'types/core/shared';

import getObjectPaths from 'utils/object/getObjectPaths';

import { buildObjectHash } from '../../helpers';

import depthInterceptors from './depthInterceptors';

export type Record = {
  index?: number;
  step: number;
  epoch?: number;
};

export interface AimFlatObjectBase<T = any> {
  key: string;
  data: T;
  record?: Record;
  [key: string]: any;
  run?: {
    // run props
    experiment: string;
    hash: string;
    // params
    [key: string]: any;
  };
}

export interface IQueryableData {
  ranges?: RecordRanges & IndexRanges;
}

export interface ProcessedData {
  objectList: AimFlatObjectBase[];
  queryable_data: IQueryableData;
  additionalData: {
    params: string[];
    sequenceInfo: string[];
    modifiers: string[];
  };
}

export type AimObjectHashCreator = {
  runHash: string;
  name?: string;
  context?: Context;
  step?: number;
  epoch?: number;
  index?: number;
};

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

export function storageDataToFlatList(
  runs: RunSearchRunView[] = [],
  sequenceName: SequenceTypesEnum,
  objectDepth: AimObjectDepths,
): ProcessedData {
  const objectList: AimFlatObjectBase[] = []; // @CHECK make by hash function
  let params: string[] = [];
  let sequenceInfo: string[] = [];
  let modifiers: string[] = [
    'run.hash',
    'run.name',
    'run.experiment',
    'run.creation_time',
    'run.end_time',
    'run.archived',
    'run.active',
    'run.description',
  ];
  //@TODO set a good name for this var
  let record_info: string[] = [];

  const depthInterceptor = depthInterceptors[objectDepth];

  const queryable_data = collectQueryableData(runs[0]);

  runs.forEach((item) => {
    // @ts-ignore
    params = params.concat(getObjectPaths(item.params, 'run', '.'));
    let collectedDataByDepth: Omit<AimFlatObjectBase, 'data'> = {};
    let objectHashCreator: AimObjectHashCreator = {
      runHash: item.hash,
    };
    /** depth 0 */ // Container
    let run = {
      ..._.omit(item.props, ['experiment, creation_time']),
      hash: item.hash,
      experiment: item.props.experiment?.name,
      ...item.params,
    };

    // depth 0, add run data,
    // in every depth some keys will be added to this object
    // if it need to stop walking for some depth, the current value of this object
    //    will include additional keys for every depth passed before
    collectedDataByDepth = {
      ...collectedDataByDepth,
      run,
    };
    if (objectDepth === 0) {
      const object: AimFlatObjectBase = {
        key: buildObjectHash(objectHashCreator),
        ...collectedDataByDepth,
        data: depthInterceptor(item).data,
      };

      // If the object depth is Container, used run hash as a unique hash for AimObject
      // since the object is a container, it will be a unique object
      objectList.push(object);
      return;
    }
    /** depth 0 */
    if (objectDepth > 0) {
      // for readability
      item.traces.forEach((trace: any) => {
        /** depth 1 */ // Sequence
        const trace_context = {
          [sequenceName]: {
            name: trace.name,
            context: trace.context,
          },
        };

        // Generating unique hash creator obj for the AimObject using sequence name, context and container hash
        objectHashCreator = {
          ...objectHashCreator,
          ...trace_context[sequenceName],
        };

        sequenceInfo = sequenceInfo.concat(
          getObjectPaths(trace_context[sequenceName], sequenceName),
        );
        // depth 1, add context data
        collectedDataByDepth = {
          ...collectedDataByDepth,
          ...trace_context,
          // maybe need to create some key for contexts, to follow the structure
          // depth0 adding run property, depth1 add "sequence" property, not spread contexts
        };

        if (objectDepth === 1) {
          const object: AimFlatObjectBase = {
            key: buildObjectHash(objectHashCreator),
            ...collectedDataByDepth,
            data: depthInterceptor(trace).data,
          };
          objectList.push(object);
          return;
        }
        /** depth 1 */
        if (objectDepth > 1) {
          // for readability
          trace.values.forEach((sequence: any, stepIndex: number) => {
            /** depth 2 */ // STEP
            let record_data: Record = {
              step: trace.iters[stepIndex],
              // epoch: trace.epochs[stepIndex],
            };

            // Generating unique hash creator obj for the AimObject using sequence name, sequence context, step, epoch
            objectHashCreator = {
              ...objectHashCreator,
              ...record_data,
            };
            if (objectDepth === 2) {
              record_info = record_info.concat(['record.epoch', 'record.step']);

              collectedDataByDepth = {
                ...collectedDataByDepth,
                record: record_data,
              };
              const object = {
                key: buildObjectHash(objectHashCreator),
                ...collectedDataByDepth,
                data: depthInterceptor(sequence).data,
              };

              objectList.push(object);
              return;
            }
            sequence.forEach((rec: any) => {
              /** depth 3 */ // INDEX
              record_data = {
                ...record_data,
                index: rec.index,
              };
              objectHashCreator = {
                ...objectHashCreator,
                index: record_data.index,
              };
              record_info = record_info.concat([
                'record.epoch',
                'record.step',
                'record.index',
              ]);
              collectedDataByDepth = {
                ...collectedDataByDepth,
                record: record_data,
              };
              const object = {
                key: buildObjectHash(objectHashCreator),
                ...collectedDataByDepth,
                data: depthInterceptor(rec).data, // change to just blob_uri similar to Mahnerak' flat list
              };

              objectList.push(object);
            });
          });
        }
      });
    }
  });
  params = _.uniq(params);

  sequenceInfo = _.uniq(sequenceInfo);
  modifiers = [
    ..._.uniq(modifiers),
    ...params,
    ..._.uniq(record_info),
    ...sequenceInfo,
  ];

  return {
    objectList,
    queryable_data,
    additionalData: {
      params,
      sequenceInfo,
      modifiers,
    },
  };
}

export default storageDataToFlatList;
