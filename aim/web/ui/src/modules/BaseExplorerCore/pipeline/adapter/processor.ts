import _ from 'lodash';

import { RunSearchRunView } from 'types/core/AimObjects';
import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import getObjectPaths from 'utils/object/getObjectPaths';

import depthInterceptors from './depthInterceptors';

export interface AimFlatObjectBase {
  data: any;
  record?: {
    index: number;
    step: number;
  };
  [key: string]: any;
  run?: {
    // run props
    experiment: string;
    hash: string;
    // params
    [key: string]: any;
  };
}

export interface ProcessedData {
  objectList: AimFlatObjectBase[];
  additionalData: {
    params: string[];
    modifiers: string[];
  };
}

export function storageDataToFlatList(
  runs: RunSearchRunView[],
  sequenceName: SequenceTypesEnum,
  objectDepth: AimObjectDepths,
): ProcessedData {
  const objectList: AimFlatObjectBase[] = []; // @CHECK make by hash function
  let params: string[] = [];
  let sequenceInfo: string[] = [];
  let modifiers: string[] = ['run.hash', 'run.name', 'run.experiment'];

  const depthInterceptor = depthInterceptors[objectDepth];

  runs?.forEach((item) => {
    params = params.concat(getObjectPaths(item.params, 'run', '.'));
    let collectedDataByDepth: Omit<AimFlatObjectBase, 'data'> = {};

    /** depth 0 */ // RUN
    let run = {
      ..._.omit(item.props, ['experiment']),
      // hash: item.hash, @TEST hash should be in run
      inProgress: !item.props.end_time,
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
        ...collectedDataByDepth,
        data: depthInterceptor(item).data,
      };

      objectList.push(object);
      return;
    }
    /** depth 0 */
    if (objectDepth > 0) {
      // for readability
      item.traces.forEach((trace: any) => {
        /** depth 1 */ // SEQUENCE
        const trace_context = {
          [sequenceName]: {
            name: trace.name,
            context: trace.context,
            // epoch: trace.epochs.filter((x: any) => !_.isNil(x)), // @TEST check is this need
          },
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
            ...collectedDataByDepth,
            data: depthInterceptor(trace).data,
          };
          objectList.push(object); // object creating completed
          return;
        }
        /** depth 1 */
        if (objectDepth > 1) {
          // for readability
          trace.values.forEach((sequence: any, stepIndex: number) => {
            /** depth 2 */ // STEP
            sequence.forEach((rec: any) => {
              /** depth 3 */ // INDEX
              const record = {
                step: trace.iters[stepIndex],
                index: rec.index,
                epoch: trace.epochs[stepIndex],
              };
              modifiers = modifiers.concat(getObjectPaths(record, 'record'));
              collectedDataByDepth = {
                ...collectedDataByDepth,
                record,
              };
              const object = {
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
  modifiers = [..._.uniq(modifiers), ...params, ...sequenceInfo];

  return {
    objectList,
    additionalData: {
      params,
      modifiers,
    },
  };
}

export default storageDataToFlatList;
