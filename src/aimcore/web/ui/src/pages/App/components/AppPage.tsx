import * as React from 'react';

import AppWrapper from './AppWrapper';

function AppPage({ match, location, boardsList, pages }: any) {
  let boardPath = '';
  if (match?.params?.[0]) {
    boardPath = match.params[0];
  }
  const editMode = location.pathname.endsWith('/edit');

  React.useEffect(() => {
    if (boardPath) {
      document.title = `${boardPath} | Aim`;
    }
  }, [boardPath]);

  return (
    <AppWrapper
      boardsList={boardsList}
      pages={pages}
      boardPath={boardPath}
      editMode={editMode!}
    />
  );
}

export default AppPage;
