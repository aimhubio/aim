import * as React from 'react';

import { Spinner } from 'components/kit';

import Board from 'pages/Board/Board';
import useApp from 'pages/App/useApp';

function BoardVizElement(props: any) {
  const { boards, isLoading, fetchBoard } = useApp();
  const boardPath = props.data;

  let [code, setCode] = React.useState(boards?.[boardPath]?.code ?? null);

  React.useEffect(() => {
    if (code === null) {
      if (!boards?.hasOwnProperty(boardPath)) {
        fetchBoard(boardPath);
      } else {
        setCode(boards?.[boardPath]?.code!);
      }
    }
  }, [code, boards]);

  return (
    <div
      className='VizComponentContainer'
      style={{ flex: 1, padding: 0, border: 'none' }}
    >
      {isLoading || code === null ? (
        <Spinner />
      ) : (
        <Board
          data={{
            code,
            path: boardPath,
          }}
          editMode={false}
          previewMode
        />
      )}
    </div>
  );
}
export default BoardVizElement;
