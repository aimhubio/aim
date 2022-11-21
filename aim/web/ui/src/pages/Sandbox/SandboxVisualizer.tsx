import * as React from 'react';
import * as _ from 'lodash-es';
import classnames from 'classnames';

import Editor from '@monaco-editor/react';

import { Button, Spinner } from 'components/kit';

import usePyodide from 'services/pyodide/usePyodide';

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
  const { pyodide, namespace } = usePyodide();

  const editorValue = React.useRef(initialCode);
  const [result, setResult] = React.useState<Record<string, any>>([[]]);
  const [isProcessing, setIsProcessing] = React.useState<boolean | null>(null);
  const [execCode, setExecCode] = React.useState('');
  const [state, setState] = React.useState<any>();
  const effect = React.useRef<any>();
  const [executionCount, setExecutionConut] = React.useState<number>(0);

  (window as any).updateLayout = (grid: any) => {
    setResult(toObject(grid.toJs()));
  };

  React.useEffect(() => {
    if (pyodide !== null) {
      execute();
    }
  }, [pyodide]);

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
          .replaceAll('= Distributions.query', '= await Distributions.query')
          .replaceAll('def ', 'async def ')
          .replaceAll('async async def ', 'async def ');
        const packagesList = pyodide?.pyodide_py.find_imports(code).toJs();

        if (packagesList.includes('plotly')) {
          await pyodide?.loadPackage('micropip');
          const micropip = pyodide?.pyimport('micropip');
          await micropip.install('plotly');
        }

        if (packagesList.includes('hrepr')) {
          await pyodide.loadPackage('micropip');
          const micropip = pyodide.pyimport('micropip');
          await micropip.install('hrepr');
        }

        await pyodide?.loadPackagesFromImports(code);

        setExecutionConut((eC) => eC + 1);
        setExecCode(code);
      } catch (ex) {
        console.log(ex);
      }
    }
  }, [pyodide, editorValue]);

  const runParsedCode = React.useCallback(() => {
    if (pyodide !== null) {
      pyodide
        ?.runPythonAsync(execCode, { globals: namespace })
        .then(runEffect)
        .catch((ex: unknown) => {
          console.log(ex);
          setIsProcessing(false);
        });
    }
  }, [pyodide, execCode, state]);

  const runEffect = React.useCallback(async () => {
    if (pyodide !== null) {
      effect.current = namespace.get('render');
      if (effect.current) {
        const res = await effect.current(pyodide?.toPy(state), (val: any) =>
          setState((s: any) => Object.assign({}, s, toObject(val.toJs()))),
        );
        let parsedResult = toObject(res.toJs());
        setResult(parsedResult);
      }

      setIsProcessing(false);
    }
  }, [pyodide, state]);

  React.useEffect(() => {
    if (execCode) {
      runParsedCode();
    }
  }, [execCode, executionCount]);

  React.useEffect(() => {
    if (state) {
      runEffect();
    }
  }, [state]);

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
            {result.map(
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
