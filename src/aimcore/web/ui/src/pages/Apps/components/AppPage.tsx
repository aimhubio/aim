import * as React from 'react';

import AppWrapper from './AppWrapper';

function AppPage({ match, location, history, data, appName }: any) {
  let boardPath = '';
  if (match?.params?.[0]) {
    boardPath = match.params[0];
  }

  const editMode = location.pathname.endsWith('/edit');

  const getStateFromURL = React.useCallback(() => {
    let searchParams = new URLSearchParams(window.location.search);
    let stateParam = searchParams.get('state');

    if (stateParam) {
      return decodeURIComponent(stateParam);
    }

    return '';
  }, []);

  let [stateStr, setStateStr] = React.useState(getStateFromURL());

  const updateStateStr = React.useCallback(() => {
    setStateStr(getStateFromURL());
  }, []);

  React.useEffect(() => {
    if (boardPath) {
      document.title = `${boardPath} | Aim`;
    }
    updateStateStr();
  }, [boardPath]);

  React.useEffect(() => {
    (function (history: any) {
      var pushState = history.pushState;
      history.pushState = function (state: any) {
        if (typeof history.onpushstate == 'function') {
          history.onpushstate({ state: state });
        }

        return pushState.apply(history, arguments);
      };
    })(window.history);

    window.onpopstate = history.onpushstate = updateStateStr;
  }, []);

  return (
    <AppWrapper
      appName={appName}
      boardList={data}
      boardPath={boardPath}
      editMode={editMode!}
      stateStr={stateStr}
    />
  );
}

export default AppPage;
