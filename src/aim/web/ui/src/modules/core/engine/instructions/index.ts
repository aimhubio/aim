import _ from 'lodash-es';

import { getParams, GetParamsResult } from 'modules/core/api/projectApi';
import { INotificationsEngine } from 'modules/core/engine/notifications';
import AimError from 'modules/core/AimError';

import { SequenceTypesEnum } from 'types/core/enums';

import createState, {
  IInstructionsState,
  InstructionsStateBridge,
} from './state';

export interface IInstructionsEngine<
  TStore,
  SequenceName extends SequenceTypesEnum,
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
  options: { sequenceName: SequenceTypesEnum },
  notificationsEngine?: INotificationsEngine<TStore>['engine'],
): IInstructionsEngine<TStore, typeof options.sequenceName> {
  const state = createState<TStore, typeof options.sequenceName>(store);

  const getInstructions = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      getParams({ sequence: options.sequenceName })
        .then((params: GetParamsResult) => {
          state.setInfo(params, params[options.sequenceName]);
          resolve(_.isEmpty(params[options.sequenceName]));
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
