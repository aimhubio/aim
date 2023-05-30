import _ from 'lodash-es';

import {
  getProjectsInfo,
  GetProjectsInfoResult,
} from 'modules/core/api/projectApi';
import { INotificationsEngine } from 'modules/core/engine/notifications';
import AimError from 'modules/core/AimError';

import { SequenceType } from 'types/core/enums';

import createState, {
  IInstructionsState,
  InstructionsStateBridge,
} from './state';

export interface IInstructionsEngine<
  TStore,
  SequenceName extends SequenceType,
> {
  state: {
    instructions: IInstructionsState<SequenceName>;
  };
  engine: {
    getInstructions: () => Promise<boolean>;
  } & Omit<
    InstructionsStateBridge<TStore, SequenceName>,
    'initialState' | 'selectors'
  > &
    InstructionsStateBridge<TStore, SequenceName>['selectors'];
}

function createInstructionsEngine<TStore>(
  store: any,
  options: { sequenceType: SequenceType },
  notificationsEngine?: INotificationsEngine<TStore>['engine'],
): IInstructionsEngine<TStore, typeof options.sequenceType> {
  const state = createState<TStore, typeof options.sequenceType>(store);

  const getInstructions = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      getProjectsInfo({ sequence: [options.sequenceType] })
        .then((info: GetProjectsInfoResult) => {
          const { sequences } = info;
          state.setInfo(sequences, sequences[options.sequenceType]);
          resolve(_.isEmpty(sequences[options.sequenceType]));
        })
        .catch((e) => {
          const aimError = new AimError(e.message || e, e.detail).getError();
          state.setError(aimError);
          reject(aimError);
          notificationsEngine?.error(aimError.message);
        });
    });
  };

  return {
    state: {
      instructions: state.initialState,
    },
    engine: {
      ..._.omit(state, ['selectors']),
      ...state.selectors,
      getInstructions,
    },
  };
}

export default createInstructionsEngine;
