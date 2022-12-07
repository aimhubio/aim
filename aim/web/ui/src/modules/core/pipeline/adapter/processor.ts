import _ from 'lodash-es';

import { buildObjectHash } from 'modules/core/utils/hashing';

import { RunSearchRunView } from 'types/core/AimObjects';
import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import { Record } from 'types/core/shared';
import { AimFlatObjectBase } from 'types/core/AimObjects/AimFlatObjectBase';

import getObjectPaths from 'utils/object/getObjectPaths';

import depthInterceptors from './depthInterceptors';
import { ObjectHashCreator, ProcessedData } from './types';
import collectQueryableData from './collectQueryableData';

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
    let objectHashCreator: ObjectHashCreator = {
      runHash: item.hash,
    };
    /** depth 0 */ // Container
    let run = {
      ..._.omit(item.props, ['experiment, creation_time']),
      hash: item.hash,
      active: !item.props.end_time, // @TODO change to active
      experiment: item.props.experiment?.name,
      experimentId: item.props.experiment?.id,
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
            };

            // Generating unique hash creator obj for the AimObject using sequence name, sequence context, step
            objectHashCreator = {
              ...objectHashCreator,
              ...record_data,
            };
            if (objectDepth === 2) {
              record_info = record_info.concat(['record.step']);

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
              record_info = record_info.concat(['record.step', 'record.index']);
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
  params = _.uniq(params).sort();

  sequenceInfo = _.uniq(sequenceInfo).sort();
  modifiers = _.uniq(modifiers).sort();
  modifiers = [
    ...modifiers,
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

export * from './types';
export default storageDataToFlatList;
