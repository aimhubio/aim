import * as React from 'react';
import * as _ from 'lodash-es';

import { Button, Icon, Spinner, Text } from 'components/kit';

import { getBasePath } from 'config/config';

import { search } from 'pages/Sandbox/search';

import NotebookCell from './NotebookCell';

import './NotebookVisualizer.scss';

(window as any).search = search;

export default function SandboxVisualizer() {
  const pyodide = React.useRef<any>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [cells, setCells] = React.useState([
    {
      initialCode: `from aim.sequences import Metric, Images, Audios, Figures, Texts 
from aim.ui.layout import Grid, Cell
from aim.ui.viz import LineChart, ImagesList, AudiosList, TextsList, FiguresList, Table, JSON`,
      key: `${Date.now()}`,
      readOnly: true,
    },
    { initialCode: '', key: `${Date.now()}`, readOnly: false },
  ]);

  (window as any).updateLayout = () => {};

  React.useEffect(() => {
    async function main() {
      pyodide.current = await (window as any).loadPyodide({
        stdout: (...args: any[]) => {
          window.requestAnimationFrame(() => {
            const terminal = document.getElementById('console');
            if (terminal) {
              terminal.innerHTML! += `<p>>>> ${args.join(', ')}</p>`;
              terminal.scrollTop = terminal.scrollHeight;
            }
          });
        },
      });

      pyodide.current.runPython(
        await (
          await fetch(`${getBasePath()}/static-files/aim_ui_core.py`)
        ).text(),
      );

      setIsLoading(false);
    }
    main();
  }, []);

  return (
    <div className='NotebookVisualizer'>
      {isLoading ? (
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
                      initialCode: '',
                      key: `${Date.now()}`,
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
