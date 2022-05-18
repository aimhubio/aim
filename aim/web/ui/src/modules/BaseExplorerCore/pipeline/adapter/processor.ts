import _ from 'lodash';

import { RunSearchRunView } from 'types/core/AimObjects';
import { SequenceTypesEnum, AimObjectDepths } from 'types/core/enums';

import getObjectPaths from 'utils/object/getObjectPaths';

type AimObject = {
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
};

export function storageDataToFlatList(
  runs: RunSearchRunView[],
  sequenceName: SequenceTypesEnum,
) {
  // @ts-ignore
  const objectDepth = AimObjectDepths[sequenceName];

  const objectHashTable: AimObject[] = []; // @CHECK make by hash function
  let params: string[] = [];
  let contexts: string[] = [];
  let modifiers: string[] = ['run.hash', 'run.name', 'run.experiment'];

  runs?.forEach((item) => {
    params = params.concat(getObjectPaths(item.params, 'run'));
    let collectedDataByDepth: Omit<AimObject, 'data'> = {
      /*
              // by default there are no order and group,
              // @CHECK maybe need to omit order and group here, because it may break caching mechanism
              modifiers: {
                order: 0,
                group: null
              }
            */
    };

    /** depth 0 */ // RUN
    let run = {
      ..._.omit(item.props, ['experiment']),
      // hash: item.hash, @TEST hash should be in run
      inProgress: !!item.props.end_time,
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
      const object: AimObject = {
        ...collectedDataByDepth,
        data: {
          traces: item.traces,
          values: item.values, // @TEST values key because there is no that key in type definition of BE
        },
      };

      objectHashTable.push(object); // object creation coplete
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
            // epoch: trace.epochs.filter((x: any) => !_.isNil(x)), // @CHECK check needness
          },
        };
        contexts = contexts.concat(
          getObjectPaths(trace_context[sequenceName], sequenceName),
        );
        // depth 1, add context data
        collectedDataByDepth = {
          ...collectedDataByDepth,
          ...trace_context,
          // maybe need to create some key for contexts, to follow the structure
          // depth0 add run property, depth1 add "sequence" property, not spreaded contexts
        };

        if (objectDepth === 1) {
          const object: AimObject = {
            ...collectedDataByDepth,
            data: trace,
          };
          objectHashTable.push(object); // object creatin coplete
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
                data: rec, // change to just blob_uri similar to Mahnerak' flat list
              };

              objectHashTable.push(object);
            });
          });
        }
      });
    }
  });

  params = _.uniq(params);
  contexts = _.uniq(contexts);
  modifiers = [..._.uniq(modifiers), ...params, ...contexts];

  console.log(modifiers);

  return {
    data: objectHashTable,
    params,
    contexts,
    modifiers,
  };
}

export default storageDataToFlatList;
