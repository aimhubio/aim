import React from 'react';

function useModel(model: any) {
  const [state, setState] = React.useState({
    ...model.getState(),
  });

  React.useEffect(() => {
    const initSubscription = model.subscribe('INIT', () =>
      setState({
        ...model.getState(),
      }),
    );
    const updateSubscription = model.subscribe('UPDATE', () =>
      setState({
        ...model.getState(),
      }),
    );

    return () => {
      initSubscription.unsubscribe();
      updateSubscription.unsubscribe();
    };
  }, []);

  return state;
}

export default useModel;
