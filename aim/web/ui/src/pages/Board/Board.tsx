import React from 'react';
import classNames from 'classnames';
import { Link as RouteLink } from 'react-router-dom';

import { Link } from '@material-ui/core';
import Editor from '@monaco-editor/react';

import { Button, Icon, Spinner, Text } from 'components/kit';
import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import { PathEnum } from 'config/enums/routesEnum';

import GridCell from 'pages/Sandbox/GridCell';

import usePyodide from 'services/pyodide/usePyodide';

import SaveBoard from './components/SaveBoard';

import './Board.scss';

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

function Board({
  data,
  isLoading,
  editMode,
  previewMode,
  notifyData,
  onNotificationDelete,
  saveBoard,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const { pyodide, namespace, isLoading: pyodideIsLoading } = usePyodide();

  const editorValue = React.useRef(data.code);
  const [result, setResult] = React.useState([[]]);
  const [isProcessing, setIsProcessing] = React.useState<boolean | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [execCode, setExecCode] = React.useState('');
  const [state, setState] = React.useState<any>();
  const [executionCount, setExecutionCount] = React.useState<number>(0);
  const timerId = React.useRef(0);

  (window as any).updateLayout = (grid: any) => {
    let layout = toObject(grid.toJs());
    grid.destroy();

    window.clearTimeout(timerId.current);
    timerId.current = window.setTimeout(() => {
      setResult(layout);
    }, 0);
  };

  (window as any).setState = (update: any) => {
    let stateUpdate = update.toJs();
    update.destroy();
    setState((s: any) => ({
      ...s,
      ...toObject(stateUpdate),
    }));
  };

  const execute = React.useCallback(async () => {
    if (pyodide !== null) {
      try {
        window.clearTimeout(timerId.current);
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

        let resetCode = `memoize_cache = {}
current_layout = [[]]
state = {}
`;
        pyodide?.runPython(resetCode, { globals: namespace });

        setState(undefined);
        setResult([[]]);
        setExecCode(code);
        setExecutionCount((eC) => eC + 1);
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
        let vizMapResetCode = `viz_map_keys = {}
`;
        pyodide?.runPython(vizMapResetCode, { globals: namespace });
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
      runParsedCode();
    }
  }, [executionCount]);

  React.useEffect(() => {
    if (state !== undefined) {
      runParsedCode();
    }
  }, [state]);

  React.useEffect(() => {
    setIsProcessing(pyodideIsLoading);
  }, [pyodideIsLoading]);

  React.useEffect(() => {
    return () => window.clearTimeout(timerId.current);
  }, []);

  return (
    <ErrorBoundary>
      <section className='Board'>
        {!previewMode && (
          <AppBar title={data.name} className='Board__appBar'>
            {editMode ? (
              <div className='Board__appBar__controls'>
                <Button
                  color='primary'
                  variant='contained'
                  size='small'
                  onClick={execute}
                >
                  Run
                </Button>
                <SaveBoard
                  saveBoard={saveBoard}
                  getEditorValue={() => editorValue.current}
                  initialState={data}
                />
              </div>
            ) : (
              <Link
                to={PathEnum.Board_Edit.replace(':boardId', data.id)}
                component={RouteLink}
                underline='none'
              >
                <Button variant='outlined' size='small'>
                  Edit{' '}
                  <Icon name='edit' style={{ marginLeft: 5 }} fontSize={12} />
                </Button>
              </Link>
            )}
          </AppBar>
        )}
        <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
          <div className='SandboxVisualizer'>
            <div className='SandboxVisualizer__main'>
              {editMode && (
                <div className='SandboxVisualizer__main__editor'>
                  <Editor
                    language='python'
                    height='100%'
                    value={editorValue.current}
                    onChange={(v) => {
                      editorValue.current = v!;
                      // setItem('sandboxCode', editorValue.current);
                    }}
                    loading={<span />}
                    options={{
                      tabSize: 4,
                      useTabStops: true,
                    }}
                  />
                </div>
              )}
              <div
                className={classNames('SandboxVisualizer__main__components', {
                  'SandboxVisualizer__main__components--loading':
                    isProcessing === null,
                  'SandboxVisualizer__main__components--processing':
                    isProcessing,
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
                {editMode && (
                  <pre
                    id='console'
                    className='SandboxVisualizer__main__components__console'
                  />
                )}
              </div>
            </div>
          </div>
        </BusyLoaderWrapper>
      </section>
      {notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={onNotificationDelete}
          data={notifyData}
        />
      )}
    </ErrorBoundary>
  );
}

export default Board;
