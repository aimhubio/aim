import _ from 'lodash-es';

import { buildObjectHash } from 'modules/core/utils/hashing';

import {
  ContainerType,
  GetContainerName,
  GetSequenceName,
  SequenceType,
} from 'types/core/enums';
import { Record } from 'types/core/shared';
import { AimFlatObjectBase } from 'types/core/AimObjects/AimFlatObjectBase';
import { GroupedSequence } from 'types/core/AimObjects/GroupedSequences';

import getObjectPaths from 'utils/object/getObjectPaths';

import collectQueryableData from './collectQueryableData';
import { ObjectHashCreator, ProcessedData } from './types';

export function storageDataToFlatList(
  groupedSeqs: GroupedSequence[] = [],
  sequenceType: SequenceType,
  containerType: ContainerType = ContainerType.Run,
): ProcessedData {
  const containerName = GetContainerName(containerType);
  const objectList: AimFlatObjectBase[] = []; // @CHECK make by hash function

  let modifiers: string[] = [`${containerName}.hash`];
  let params: string[] = [];
  let sequenceInfo: string[] = [];
  let recordInfo: string[] = [];

  const queryable_data = collectQueryableData(groupedSeqs);

  function pushToObjectList(object: AimFlatObjectBase) {
    objectList.push(object);
  }

  function concatParams(seq_params: string[]) {
    params = params.concat(seq_params);
  }

  function concatSequenceInfo(sequence_info: string[]) {
    sequenceInfo = sequenceInfo.concat(sequence_info);
  }

  function concatRecordInfo(record_info: string[]) {
    recordInfo = recordInfo.concat(record_info);
  }

  for (const groupedSeq of groupedSeqs) {
    concatParams(getObjectPaths(groupedSeq.params, containerName, '.'));

    sequencesToFlat({
      groupedSeq,
      sequenceType,
      containerType,
      pushToObjectList,
      concatSequenceInfo,
      concatRecordInfo,
    });
  }
  params = _.uniq(params).sort();
  sequenceInfo = _.uniq(sequenceInfo).sort();
  modifiers = _.uniq(modifiers).sort();
  recordInfo = _.uniq(recordInfo).sort();
  modifiers = [...modifiers, ...params, ...recordInfo, ...sequenceInfo];

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

function sequencesToFlat({
  groupedSeq,
  sequenceType,
  containerType,
  pushToObjectList,
  concatSequenceInfo,
  concatRecordInfo,
}: any) {
  let collectedData: Omit<AimFlatObjectBase, 'data'> = {};

  let hashObject: ObjectHashCreator = { hash: groupedSeq.hash };
  let container = { hash: groupedSeq.hash, ...groupedSeq.params };

  const sequenceName = GetSequenceName(sequenceType);
  const containerName = GetContainerName(containerType);

  collectedData = { ...collectedData, [containerName]: container };

  for (let seqIndex = 0; seqIndex < groupedSeq.sequences.length; seqIndex++) {
    const sequence = groupedSeq.sequences[seqIndex];
    const context = {
      [sequenceName]: {
        name: sequence.name,
        context: sequence.context,
      },
    };

    // Generating unique hash creator obj for the AimObject using sequence name, context and container hash
    hashObject = {
      ...hashObject,
      ...context[sequenceName],
    };

    let sequenceData = {
      sequence: {
        ...context[sequenceName],
        type: sequenceName,
      },
    };

    concatSequenceInfo(getObjectPaths(context[sequenceName], sequenceName));

    collectedData = {
      ...collectedData,
      ...context,
      // maybe need to create some key for contexts, to follow the structure
      // depth0 adding run property, depth1 add "sequence" property, not spread contexts
    };

    if (sequenceType === SequenceType.Metric) {
      pushToObjectList({
        key: buildObjectHash(hashObject),
        ...collectedData,
        ...sequenceData,
        data: sequence,
      });
    } else {
      valuesToFlat({
        sequence,
        sequenceData,
        collectedData,
        hashObject,
        pushToObjectList,
        concatRecordInfo,
      });
    }
  }
}

function valuesToFlat({
  sequence,
  sequenceData,
  collectedData,
  hashObject,
  pushToObjectList,
  concatRecordInfo,
}: any) {
  for (const stepIndex in sequence.steps) {
    const step = sequence.steps[stepIndex];
    const value = sequence.values[stepIndex];

    let record_data: Record = { step };

    // Generating unique hash creator obj for the AimObject using sequence name, sequence context, step
    hashObject = {
      ...hashObject,
      ...record_data,
    };

    concatRecordInfo(['record.step']);

    collectedData = {
      ...collectedData,
      record: record_data,
    };

    if (Array.isArray(value)) {
      for (let recIndex = 0; recIndex < value.length; recIndex++) {
        record_data = {
          ...record_data,
          index: recIndex,
        };
        hashObject = {
          ...hashObject,
          index: record_data.index,
        };

        concatRecordInfo(['record.step', 'record.index']);

        collectedData = {
          ...collectedData,
          record: record_data,
        };
        pushToObjectList({
          key: buildObjectHash(hashObject),
          ...collectedData,
          ...sequenceData,
          data: value[recIndex],
        });
      }
    } else {
      pushToObjectList({
        key: buildObjectHash(hashObject),
        ...collectedData,
        ...sequenceData,
        data: value,
      });
    }
  }
}
