import { shouldMatchObject } from 'tests/utils';

import createModel from 'services/models/model';

const initialState = {
  test: {
    hello: 'hello',
  },
};

describe('[function createModel]', () => {
  test('should create model correctly width empty state', () => {
    const model = createModel({});
    shouldMatchObject(model.getState(), {});
  });

  test('should create model correctly width state', () => {
    const model = createModel(initialState);
    shouldMatchObject(model.getState(), initialState);
  });
});

describe("[model's methods]", () => {
  let model: any;
  beforeEach(() => {
    model = createModel(initialState);
  });

  test('[setState method] should work properly', () => {
    model.setState({ test: 'test' });
    shouldMatchObject({ test: 'test' }, model.getState());
  });

  test('[subscribe/unsubscribe methods] should work properly', () => {
    const mockSubscriber = jest.fn((res) => res);
    const { unsubscribe } = model.subscribe('UPDATE', mockSubscriber);

    model.setState({ test: 'test' });
    expect(mockSubscriber).toHaveBeenCalledTimes(1);

    model.setState({ test: 'test2' });
    expect(mockSubscriber).toHaveBeenCalledTimes(2);

    unsubscribe();
    model.setState({ test: 'test3' });
    expect(mockSubscriber).not.toHaveBeenCalledTimes(3);
  });

  test('[destroy method] should re-init the state and remove subscriptions', () => {
    const mockSubscriber = jest.fn((res) => res);
    model.setState({ empty: true });
    model.subscribe('UPDATE', mockSubscriber);

    model.destroy();
    shouldMatchObject(initialState, model.getState());

    model.setState({});
    expect(mockSubscriber).not.toHaveBeenCalled();
  });
});
