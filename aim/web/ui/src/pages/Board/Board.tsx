import React from 'react';
import classNames from 'classnames';
import { Link as RouteLink } from 'react-router-dom';

import { Link } from '@material-ui/core';
import Editor from '@monaco-editor/react';

import { Button, Icon, Spinner } from 'components/kit';
import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import { PathEnum } from 'config/enums/routesEnum';

import usePyodide from 'services/pyodide/usePyodide';

import SaveBoard from './components/SaveBoard';
import GridCell from './components/GridCell';

import './Board.scss';

function constructTree(elems: any, tree: any) {
  for (let i = 0; i < elems.length; i++) {
    let elem = elems[i];
    if (elem.element === 'block') {
      if (!elem.parent_block) {
        tree.root.elements[elem.block_context.id] = {
          ...elem.block_context,
          elements: {},
        };
      } else {
        if (!tree.hasOwnProperty(elem.parent_block.id)) {
          tree[elem.parent_block.id] = {
            id: elem.parent_block.id,
            elements: {},
          };
        }
        tree[elem.parent_block.id].elements[elem.block_context.id] = {
          ...elem.block_context,
          elements: {},
        };
      }
      tree[elem.block_context.id] = {
        ...elem.block_context,
        elements: {},
      };
    } else {
      if (!elem.parent_block) {
        tree.root.elements[elem.key] = elem;
      } else {
        tree[elem.parent_block.id].elements[elem.key] = elem;
      }
    }
  }

  return tree;
}

function renderTree(tree: any, elements: any) {
  return Object.values(elements).map((element: any, i: number) => {
    if (element.type === 'row' || element.type === 'column') {
      return (
        <div key={element.type + i} className={`block--${element.type}`}>
          {renderTree(tree, tree[element.id].elements)}
        </div>
      );
    }

    return <GridCell key={i} viz={element} />;
  });
}

function Board({
  data,
  isLoading,
  editMode,
  newMode,
  previewMode,
  notifyData,
  onNotificationDelete,
  saveBoard,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const {
    pyodide,
    namespace,
    isLoading: pyodideIsLoading,
    model: pyodideModel,
  } = usePyodide();

  const boardId = data.id;

  const editorValue = React.useRef(data.code);
  const timerId = React.useRef(0);

  const [state, setState] = React.useState<any>({
    layout: {
      blocks: [],
      components: [],
    },
    isProcessing: null,
    error: null,
    execCode: '',
    stateUpdateCount: 0,
    executionCount: 0,
  });

  const execute = React.useCallback(async () => {
    if (pyodide !== null) {
      try {
        window.clearTimeout(timerId.current);
        setState((s: any) => ({
          ...s,
          isProcessing: true,
        }));
        const code = editorValue.current
          .replaceAll('from aim', '# from aim')
          .replaceAll('import aim', '# import aim')
          .replaceAll('= Repo.filter', '= await Repo.filter');

        const packagesListProxy = pyodide?.pyodide_py.code.find_imports(code);
        const packagesList = packagesListProxy.toJs();
        packagesListProxy.destroy();

        for await (const lib of packagesList) {
          if (lib !== 'js') {
            await pyodide?.loadPackage('micropip');
            try {
              const micropip = pyodide?.pyimport('micropip');
              await micropip.install(lib);
            } catch (ex) {
              // eslint-disable-next-line no-console
              console.log(ex);
            }
          }
        }

        await pyodide?.loadPackagesFromImports(code);

        let resetLayoutCode = 'current_layout = []';
        pyodide?.runPython(resetLayoutCode, { globals: namespace });

        setState((s: any) => ({
          ...s,
          layout: {
            blocks: [],
            components: [],
          },
          execCode: code,
          executionCount: s.executionCount + 1,
        }));
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

  const runParsedCode = React.useCallback(async () => {
    if (pyodide !== null) {
      try {
        let resetCode = `viz_map_keys = {}
block_context = {
  "current": 0,
}
board_id=${boardId === undefined ? 'None' : `"${boardId}"`}
`;
        const code =
          resetCode +
          state.execCode.replace(
            /Repo.filter(\((.|\n)*?\))/g,
            (match: string) => {
              return `${match}
board_id=${boardId === undefined ? 'None' : `"${boardId}"`}
`;
            },
          );

        await pyodide?.runPythonAsync(code, {
          globals: namespace,
        });

        setState((s: any) => ({
          ...s,
          error: null,
          isProcessing: false,
        }));
      } catch (ex: any) {
        // eslint-disable-next-line no-console
        console.log(ex);
        setState((s: any) => ({
          ...s,
          error: ex.message,
          isProcessing: false,
        }));
      }
    }
  }, [pyodide, namespace, state.execCode, state.executionCount]);

  React.useEffect(() => {
    if (state.executionCount > 0) {
      runParsedCode();
    }
  }, [state.executionCount]);

  React.useEffect(() => {
    if (state.stateUpdateCount > 0) {
      runParsedCode();
    }
  }, [state.stateUpdateCount]);

  React.useEffect(() => {
    if (pyodideIsLoading) {
      setState((s: any) => ({
        ...s,
        isProcessing: true,
      }));
    }
  }, [pyodideIsLoading]);

  React.useEffect(() => {
    let subscription = pyodideModel.subscribe(
      boardId,
      ({ blocks, components, state }: any) => {
        if (components) {
          setState((s: any) => ({
            ...s,
            layout: {
              blocks: blocks[boardId] ?? [],
              components: components[boardId],
            },
          }));
        }
        if (state) {
          setState((s: any) => ({
            ...s,
            stateUpdateCount: s.stateUpdateCount + 1,
          }));
        }
      },
    );
    return () => {
      window.clearTimeout(timerId.current);
      subscription.unsubscribe();
    };
  }, [boardId]);

  const tree = constructTree(
    state.layout.blocks.concat(state.layout.components),
    {
      root: {
        id: 0,
        elements: {},
      },
    },
  );

  return (
    <ErrorBoundary>
      <section className='Board'>
        {!previewMode && (
          <AppBar title={data.name} className='Board__appBar'>
            {editMode || newMode ? (
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
                <Link
                  to={PathEnum.Board.replace(
                    ':boardId',
                    newMode ? '' : boardId,
                  )}
                  component={RouteLink}
                  underline='none'
                >
                  <Button variant='outlined' size='small'>
                    Cancel
                  </Button>
                </Link>
              </div>
            ) : (
              <Link
                to={PathEnum.Board_Edit.replace(':boardId', boardId)}
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
        <BusyLoaderWrapper
          isLoading={pyodideIsLoading || isLoading}
          height={'100%'}
        >
          <div className='BoardVisualizer'>
            <div className='BoardVisualizer__main'>
              {editMode && (
                <div className='BoardVisualizer__main__editor'>
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
              )}
              <div
                className={classNames('BoardVisualizer__main__components', {
                  'BoardVisualizer__main__components--loading':
                    state.isProcessing === null,
                  'BoardVisualizer__main__components--processing':
                    state.isProcessing,
                  'BoardVisualizer__main__components--fullWidth': !editMode,
                })}
              >
                {state.isProcessing !== false && (
                  <div className='BoardVisualizer__main__components__spinner'>
                    <Spinner />
                  </div>
                )}
                <div
                  key={`${state.isProcessing}`}
                  className='BoardVisualizer__main__components__viz'
                >
                  {state.error ? (
                    <pre className='BoardVisualizer__main__components__viz__error'>
                      {state.error}
                    </pre>
                  ) : (
                    renderTree(tree, tree.root.elements)
                  )}
                </div>
                {editMode && (
                  <pre
                    id='console'
                    className='BoardVisualizer__main__components__console'
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
