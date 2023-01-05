import * as React from 'react';
import classnames from 'classnames';

import Editor from '@monaco-editor/react';

import { Button, Spinner } from 'components/kit';

import usePyodide from 'services/pyodide/usePyodide';

import { getItem, setItem } from 'utils/storage';

import { initialCode } from './sandboxCode';
import GridCell from './GridCell';

import './SandboxVisualizer.scss';

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
  const { pyodide, namespace, isLoading } = usePyodide();

  const editorValue = React.useRef(getItem('sandboxCode') ?? initialCode);
  const [result, setResult] = React.useState<Record<string, any>>([[]]);
  const [isProcessing, setIsProcessing] = React.useState<boolean | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [execCode, setExecCode] = React.useState('');
  const [state, setState] = React.useState<any>();
  const [executionCount, setExecutionCount] = React.useState<number>(0);
  const timerId = React.useRef(0);

  (window as any).updateLayout = (grid: any) => {
    let layout = toObject(grid.toJs());
    grid.destroy();

    (window as any).view = layout;

    window.clearTimeout(timerId.current);
    timerId.current = window.setTimeout(() => {
      setResult(layout);
    }, 100);
  };
  (window as any).setState = (update: any) => {
    setState((s: any) => ({
      ...s,
      ...toObject(update.toJs()),
    }));
    update.destroy();
  };
  (window as any).state = state;
  (window as any).view = result;

  const execute = React.useCallback(async () => {
    if (pyodide !== null) {
      try {
        setIsProcessing(true);
        const code = editorValue.current
          .replaceAll('from aim', '# from aim')
          .replaceAll('import aim', '# import aim')
          .replaceAll('= Metric.query', '= await Metric.query')
          .replaceAll('= Images.query', '= await Images.query')
          .replaceAll('= Audios.query', '= await Audios.query')
          .replaceAll('= Figures.query', '= await Figures.query')
          .replaceAll('= Texts.query', '= await Texts.query')
          .replaceAll('= Distributions.query', '= await Distributions.query');

        const packagesListProxy = pyodide?.pyodide_py.code.find_imports(code);
        const packagesList = packagesListProxy.toJs();
        packagesListProxy.destroy();

        for await (const lib of packagesList) {
          await pyodide?.loadPackage('micropip');
          const micropip = pyodide?.pyimport('micropip');
          await micropip.install(lib);
        }

        await pyodide?.loadPackagesFromImports(code);

        (window as any).search.cache.clear();
        (window as any).state = undefined;
        (window as any).view = [[]];

        setState(undefined);
        setResult([[]]);
        setExecutionCount((eC) => eC + 1);
        let vizMapResetCode = `viz_map_keys = {}
`;
        setExecCode(vizMapResetCode.concat(code));
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.log(ex);
      }
    }
  }, [pyodide, editorValue]);

  React.useEffect(() => {
    if (pyodide !== null) {
      execute();
    }
  }, [pyodide, execute]);

  const runParsedCode = React.useCallback(() => {
    if (pyodide !== null) {
      try {
        console.time('run');
        pyodide
          ?.runPythonAsync(execCode, { globals: namespace })
          .then(() => {
            console.timeEnd('run');
            setError(null);
            setIsProcessing(false);
          })
          .catch((ex: Error) => {
            setError(ex.message);
            setIsProcessing(false);
          });
      } catch (ex: unknown) {
        // eslint-disable-next-line no-console
        console.log(ex);
        setIsProcessing(false);
      }
    }
  }, [pyodide, execCode, namespace, state, executionCount]);

  React.useEffect(() => {
    if (execCode) {
      (window as any).state = state;
      (window as any).view = result;
      runParsedCode();
    }
  }, [execCode, runParsedCode]);

  React.useEffect(() => {
    setIsProcessing(isLoading);
  }, [isLoading]);

  React.useEffect(() => {
    return () => window.clearTimeout(timerId.current);
  }, []);

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
            onChange={(v) => {
              editorValue.current = v!;
              setItem('sandboxCode', editorValue.current);
            }}
            loading={<span />}
            options={{
              tabSize: 4,
              useTabStops: true,
            }}
          />
        </div>
        <div
          key={`${isProcessing}`}
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
            {error ? (
              <pre className='SandboxVisualizer__main__components__viz__error'>
                {error}
              </pre>
            ) : (
              result.map(
                (row: any[], i: number) =>
                  row && (
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
                          viz && (
                            <GridCell
                              key={i}
                              viz={viz}
                              maxWidth={`${100 / row.length}%`}
                            />
                          )
                        );
                      })}
                    </div>
                  ),
              )
            )}
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
