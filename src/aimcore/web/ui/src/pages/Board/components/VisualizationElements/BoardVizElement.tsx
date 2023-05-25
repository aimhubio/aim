import * as React from 'react';

import { Spinner } from 'components/kit';

import Board from 'pages/Board/Board';
import useApp from 'pages/App/useApp';

function BoardVizElement(props: any) {
  const { data, isLoading } = useApp();
  const boardPath = props.data;

  const board = data.find((path: any) => path === boardPath);

  return (
    <div className='VizComponentContainer' style={{ flex: 1, padding: 0 }}>
      {isLoading ? (
        <Spinner />
      ) : board ? (
        <Board
          data={{
            code: board,
            path: boardPath,
          }}
          editMode={false}
          previewMode
        />
      ) : null}
    </div>
  );
}
export default BoardVizElement;
