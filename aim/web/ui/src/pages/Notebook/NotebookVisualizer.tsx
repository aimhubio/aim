import * as React from 'react';
import * as _ from 'lodash-es';

import { Button, Icon, Spinner, Text } from 'components/kit';

import { search } from 'pages/Sandbox/search';

import usePyodide from 'services/pyodide/usePyodide';

import NotebookCell from './NotebookCell';

import './NotebookVisualizer.scss';

(window as any).search = search;

export default function SandboxVisualizer() {
  let { isLoading, pyodide } = usePyodide();

  const [cells, setCells] = React.useState([
    {
      code: `from aim.sequences import Metric, Images, Audios, Figures, Texts 
from aim.ui.layout import Grid, Cell
from aim.ui.viz import LineChart, ImagesList, AudiosList, TextsList, FiguresList, Table, JSON`,
      key: '0',
      readOnly: true,
    },
    { code: '', key: '1', readOnly: false },
  ]);

  (window as any).updateLayout = () => {};

  return (
    <div className='NotebookVisualizer'>
      {isLoading !== false ? (
        <Spinner />
      ) : (
        cells.map((cell, i) => (
          <React.Fragment key={cell.key}>
            <NotebookCell pyodide={pyodide} {...cell} />
            <Button
              onClick={() =>
                setCells((c) =>
                  c
                    .slice(0, i + 1)
                    .concat({
                      code: '',
                      key: `${c.length}`,
                      readOnly: false,
                    })
                    .concat(c.slice(i + 1)),
                )
              }
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
