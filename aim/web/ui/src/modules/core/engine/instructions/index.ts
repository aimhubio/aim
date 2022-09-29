import { isEmpty, omit } from 'lodash-es';

import { getParams, GetParamsResult } from 'modules/core/api/projectApi';

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
): IInstructionsEngine<TStore, typeof options.sequenceName> {
  const state = createState<TStore, typeof options.sequenceName>(store);

  const getInstructions = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      getParams({ sequence: options.sequenceName })
        .then((params: GetParamsResult) => {
          state.setInfo(params, params[options.sequenceName]);
          resolve(isEmpty(params[options.sequenceName]));
        })
        .catch((err: unknown) => {
          // TODO correct error type
          state.setError((err as string) || null);
          reject(err);
        });
    });
  };

  return {
    state: {
      instructions: state.initialState,
    },
    engine: {
      ...omit(state, ['selectors']),
      ...state.selectors,
      getInstructions,
    },
  };
}

export default createInstructionsEngine;
