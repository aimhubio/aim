import * as React from 'react';

import { Spinner } from 'components/kit';

import Board from 'pages/Board/Board';
import useApp from 'pages/App/useApp';

function BoardVizElement(props: any) {
  const { data, isLoading } = useApp();
  const boardId = props.data;

  const board = data.find((b: any) => b.id === boardId);

  return (
    <div
      className='VizComponentContainer'
      style={{ flex: 1, display: 'block', padding: 0 }}
    >
      {isLoading ? (
        <Spinner />
      ) : board ? (
        <Board
          data={{
            code: board.code,
            id: boardId,
          }}
          editMode={false}
          previewMode
        />
      ) : null}
    </div>
  );
}
export default BoardVizElement;
