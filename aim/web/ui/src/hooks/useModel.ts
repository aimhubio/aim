import React from 'react';

import { IModel } from 'types/services/models/model';

function useModel<StateType>(
  model: IModel<StateType>,
  cleanUpOnExit: boolean = true,
): StateType | null {
  const [state, setState] = React.useState<StateType | null>(model.getState());

  React.useEffect(() => {
    const initSubscription = model.subscribe('INIT', () =>
      setState(model.getState()),
    );
    const updateSubscription = model.subscribe('UPDATE', () =>
      setState(model.getState()),
    );

    return () => {
      if (cleanUpOnExit) {
        initSubscription.unsubscribe();
        updateSubscription.unsubscribe();
        model.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

export default useModel;
