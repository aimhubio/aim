import { renderHook, act } from '@testing-library/react-hooks';
import { shouldMatchObject } from 'tests/utils';

import useModel from 'hooks/model/useModel';

import createModel from 'services/models/model';

import { IModel } from 'types/services/models/model';

const initialState = { forHook: true };
let model: IModel<any>;
beforeAll(() => {
  model = createModel(initialState);
});

describe('[useModel]', () => {
  test('state create/update works properly', () => {
    const { result } = renderHook(() => useModel(model));
    act(() => {
      model.setState({ test: 'test2' });
    });

    shouldMatchObject({ ...initialState, test: 'test2' }, result.current);
  });

  test('should re-init the model once unmounting', () => {
    const { result, unmount } = renderHook(() => useModel(model));
    act(() => {
      model.setState({ test: 'test2' });
      unmount();
    });

    shouldMatchObject(initialState, result.current);
  });
});
