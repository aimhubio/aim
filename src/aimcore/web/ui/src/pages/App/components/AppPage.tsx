import * as React from 'react';

import AppWrapper from './AppWrapper';

function AppPage({ match, location, data }: any) {
  let boardPath = '';
  if (match?.params?.[0]) {
    boardPath = match.params[0];
  }
  const editMode = location.pathname.endsWith('/edit');
  const searchParams = new URLSearchParams(location.search);

  React.useEffect(() => {
    if (boardPath) {
      document.title = `${boardPath} | Aim`;
    }
  }, [boardPath]);

  return (
    <AppWrapper
      boardList={data}
      boardPath={boardPath}
      editMode={editMode!}
      stateKey={searchParams.get('state')}
    />
  );
}

export default AppPage;
