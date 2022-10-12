import * as React from 'react';
import classnames from 'classnames';

import Editor from '@monaco-editor/react';

import { Button, Spinner } from 'components/kit';

import { getBasePath } from 'config/config';

import { AlignmentOptionsEnum } from 'utils/d3';
import { filterMetricsData } from 'utils/filterMetricData';

import { initialCode } from './sandboxCode';
import { dataVizElementsMap } from './dataVizElementsMap';

import './SandboxVisualizer.scss';

export default function SandboxVisualizer(props: any) {
  const {
    engine: { pipeline },
  } = props;

  (window as any).set_layout = (grid: any[][]) => {
    return grid;
  };

  async function queryData(query: string) {
    const { data } = await pipeline.execute({
      query: {
        params: {
          q: query,
          report_progress: false,
        },
      },
    });

    return data.map((item: any) => {
      const { values, steps, epochs, timestamps } = filterMetricsData(
        item.data,
        AlignmentOptionsEnum.STEP,
      );
      return {
        name: item.data.name,
        context: item.data.context,
        values: [...values],
        steps: [...steps],
        epochs: [...epochs],
        timestamps: [...timestamps],
        run: item.run,
      };
    });
  }

  (window as any).search = queryData;

  const pyodide = React.useRef<any>();

  const editorValue = React.useRef(initialCode);
  const [result, setResult] = React.useState<Record<string, any>>([[]]);
  const [isProcessing, setIsProcessing] = React.useState<boolean | null>(null);

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
    try {
      setIsProcessing(true);
      const code = editorValue.current
        .replace('aim-ui-client', 'js')
        .replaceAll('= Metric.get', '= await Metric.get');
      await pyodide.current!.loadPackagesFromImports(code);
      pyodide.current
        .runPythonAsync(code)
        .then(() => {
          const layout = pyodide.current.globals.get('layout');
          if (layout) {
            const resultData = pyodide.current.globals.get('layout').toJs();
            const convertedResult = toObject(resultData);
            setResult(convertedResult);
          }
          setIsProcessing(false);
        })
        .catch((ex: unknown) => {
          console.log(ex);
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
                  boxShadow: '0 0 0 1px #b5b9c5',
                  maxHeight: `${100 / result.length}%`,
                }}
              >
                {row.map((viz: any) => {
                  const vizFunc =
                    dataVizElementsMap[
                      viz.type as 'LineChart' | 'DataFrame' | 'Plotly'
                    ];
                  return (
                    <div
                      key={viz.type}
                      style={{
                        position: 'relative',
                        flex: 1,
                        boxShadow: '0 0 0 1px #b5b9c5',
                        maxWidth: `${100 / row.length}%`,
                      }}
                    >
                      {vizFunc(viz)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {isProcessing !== null && (
            <pre
              id='console'
              className='SandboxVisualizer__main__components__console'
            />
          )}
        </div>
      </div>
    </div>
  );
}
