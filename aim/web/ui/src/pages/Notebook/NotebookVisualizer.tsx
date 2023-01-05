import * as React from 'react';

import { Button, Icon, Spinner, Text } from 'components/kit';

import usePyodide from 'services/pyodide/usePyodide';

import { getItem, setItem } from 'utils/storage';

import NotebookCell from './NotebookCell';

import './NotebookVisualizer.scss';

export default function SandboxVisualizer() {
  let { isLoading, pyodide, namespace } = usePyodide();

  const prevCode = getItem('notebookCode');
  const content = React.useRef<
    { code: string; key: string; readOnly: boolean }[]
  >(
    prevCode
      ? JSON.parse(prevCode)
      : [
          {
            code: `from aim.sequences import Metric, Images, Audios, Figures, Texts 
from aim.ui.layout import Grid, Cell
from aim.ui.viz import LineChart, ImagesList, AudiosList, TextsList, FiguresList, Table, JSON`,
            key: '0',
            readOnly: true,
          },
          { code: '', key: '1', readOnly: false },
        ],
  );

  const [cellsCount, setCellsCount] = React.useState(content.current.length);

  function addCell(index: number) {
    content.current = content.current
      .slice(0, index + 1)
      .concat({
        code: '',
        key: `${content.current.length}`,
        readOnly: false,
      })
      .concat(content.current.slice(index + 1));
    setCellsCount(content.current.length);
  }

  function editCellCode(cellIndex: number, code: string) {
    content.current[cellIndex].code = code;
    setItem('notebookCode', JSON.stringify(content.current));
  }

  return (
    <div className='NotebookVisualizer'>
      {isLoading !== false ? (
        <Spinner />
      ) : (
        content.current.map((cell, i) => (
          <React.Fragment key={cell.key}>
            <NotebookCell
              index={i}
              pyodide={pyodide}
              namespace={namespace}
              isLoading={isLoading}
              editCellCode={editCellCode}
              {...cell}
            />
            <Button
              onClick={() => addCell(i)}
              size='xSmall'
              className='NotebookVisualizer__addCell'
            >
              <Icon name='plus' />
              <Text className='NotebookVisualizer__addCell__text'>
                Add cell
              </Text>
            </Button>
          </React.Fragment>
        ))
      )}
    </div>
  );
}
