import * as React from 'react';
import * as _ from 'lodash-es';
import classnames from 'classnames';

import Editor from '@monaco-editor/react';

import { Button, Spinner } from 'components/kit';

import { getBasePath } from 'config/config';

import { initialCode } from './sandboxCode';
import { search } from './search';
import VizContainer from './VizContainer';
import { dataVizElementsMap } from './dataVizElementsMap';

import './SandboxVisualizer.scss';

(window as any).search = search;

function toObject(x: any): any {
  if (x instanceof Map) {
    return Object.fromEntries(
      Array.from(x.entries(), ([k, v]) => [k, toObject(v)]),
    );
  } else if (x instanceof Array) {
    return x.map(toObject);
  } else {
    return x;
  }
}

export default function SandboxVisualizer() {
  const pyodide = React.useRef<any>();

  const editorValue = React.useRef(initialCode);
  const [result, setResult] = React.useState<Record<string, any>>([[]]);
  const [isProcessing, setIsProcessing] = React.useState<boolean | null>(null);

  (window as any).updateLayout = (grid: any) => {
    setResult(toObject(grid.toJs()));
  };

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

      // await pyodide.current.loadPackage('micropip');
      // const micropip = pyodide.current.pyimport('micropip');
      // await micropip.install('plotly');

      pyodide.current.runPython(
        await (
          await fetch(`${getBasePath()}/static-files/aim_ui_core.py`)
        ).text(),
      );

      execute();
    }
    main();
  }, []);

  const execute = React.useCallback(async () => {
    try {
      setIsProcessing(true);
      const code = editorValue.current
        .replace('from aim-ui-client', '# from aim-ui-client')
        .replaceAll('= Metric.get', '= await Metric.get')
        .replaceAll('= Image.get', '= await Image.get')
        .replaceAll('= Audio.get', '= await Audio.get')
        .replaceAll('= Figure.get', '= await Figure.get')
        .replaceAll('= Text.get', '= await Text.get')
        .replaceAll('= Distribution.get', '= await Distribution.get')
        .replaceAll('def ', 'async def ')
        .replaceAll('async async def ', 'async def ');
      await pyodide.current!.loadPackagesFromImports(code);
      pyodide.current
        .runPythonAsync(code)
        .then(() => {
          setIsProcessing(false);
        })
        .catch((ex: unknown) => {
          console.log(ex);
          setIsProcessing(false);
        });
    } catch (ex) {
      console.log(ex);
    }
  }, [editorValue]);

  return (
    <div className='SandboxVisualizer'>
      <div className='SandboxVisualizer__panel'>
        <Button
          color='primary'
          variant='contained'
          size='small'
          onClick={execute}
        >
          Run
        </Button>
      </div>
      <div className='SandboxVisualizer__main'>
        <div className='SandboxVisualizer__main__editor'>
          <Editor
            language='python'
            height='100%'
            value={editorValue.current}
            onChange={(v) => (editorValue.current = v!)}
            loading={<span />}
            options={{
              tabSize: 4,
              useTabStops: true,
            }}
          />
        </div>
        <div
          className={classnames('SandboxVisualizer__main__components', {
            'SandboxVisualizer__main__components--loading':
              isProcessing === null,
            'SandboxVisualizer__main__components--processing': isProcessing,
          })}
        >
          {isProcessing !== false && (
            <div className='SandboxVisualizer__main__components__spinner'>
              <Spinner />
            </div>
          )}
          <div
            key={`${isProcessing}`}
            className='SandboxVisualizer__main__components__viz'
          >
            {result.map((row: any[], i: number) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flex: 1,
                  maxHeight: `${100 / result.length}%`,
                }}
              >
                {row.map((viz: any, i: number) => {
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'relative',
                        flex: 1,
                        backgroundColor: '#d2d4dc',
                        boxShadow: '0 0 0 1px #b5b9c5',
                        maxWidth: `${100 / row.length}%`,
                        margin: '5px',
                        background: '#fff',
                        backgroundImage:
                          'radial-gradient(#b5b9c5 1px, transparent 0)',
                        backgroundSize: '10px 10px',
                        overflow: 'hidden',
                      }}
                    >
                      {viz.no_facet ? (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#fff',
                            overflow: 'auto',
                          }}
                        >
                          {Array.isArray(viz.data) ? (
                            Object.values(_.groupBy(viz.data, 'type')).map(
                              (vals, i) => (
                                <div
                                  key={`${i}-${vals[0].type}`}
                                  style={{
                                    minWidth: 'calc(100% - 10px)',
                                    minHeight: 'calc(100% - 10px)',
                                    height: 'calc(100% - 10px)',
                                    padding: '5px',
                                    margin: '5px',
                                    border: '1px solid #d2d4dc',
                                  }}
                                >
                                  {dataVizElementsMap[
                                    (typeof viz.type === 'function'
                                      ? viz.type(vals[0].type)
                                      : viz.type) as 'LineChart'
                                  ]({
                                    ...viz,
                                    data: vals,
                                  })}
                                </div>
                              ),
                            )
                          ) : (
                            <div
                              style={{
                                minWidth: 'calc(100% - 10px)',
                                minHeight: 'calc(100% - 10px)',
                                height: 'calc(100% - 10px)',
                                padding: '5px',
                                margin: '5px',
                                border: '1px solid #d2d4dc',
                              }}
                            >
                              {dataVizElementsMap[viz.type as 'LineChart'](viz)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <VizContainer viz={viz} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <pre
            id='console'
            className='SandboxVisualizer__main__components__console'
          />
        </div>
      </div>
    </div>
  );
}
