import React from 'react';
import _ from 'lodash-es';

import Editor from '@monaco-editor/react';
import { IconPencil } from '@tabler/icons-react';

import { Spinner } from 'components/kit';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ResizingFallback from 'components/ResizingFallback';
import { Box, Button, Link, Tabs, Breadcrumb } from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';
import { TopBar } from 'config/stitches/foundations/layout';

import usePyodide from 'services/pyodide/usePyodide';

import { getItem } from 'utils/storage';

import pyodideEngine from '../../services/pyodide/store';

import SaveBoard from './components/SaveBoard';
import GridCell from './components/GridCell';
import useBoardStore from './BoardSore';
import BoardLeavingGuard from './components/BoardLeavingGuard';
import {
  BoardBlockTab,
  BoardComponentsViz,
  BoardSpinner,
  BoardVisualizerComponentsPane,
  BoardVisualizerContainer,
  BoardVisualizerEditorPane,
  BoardVisualizerPane,
} from './Board.style';
import BoardConsole from './components/BoardConsole';

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
  const { isLoading: pyodideIsLoading, pyodide, namespace } = usePyodide();
  const editorRef = React.useRef<any>(null);
  const vizContainer = React.useRef<any>(null);
  const boxContainer = React.useRef<any>(null);
  const setEditorValue = useBoardStore((state) => state.setEditorValue);
  const destroyBoardStore = useBoardStore((state) => state.destroy);

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
    stateUpdateCount: 0, // @TODO[optimize perf]: remove, use fired event instead
    executionCount: 0, // @TODO[optimize perf]: remove, use fired event instead
  });

  const execute = React.useCallback(async () => {
    if (pyodide !== null && pyodideIsLoading === false) {
      try {
        window.clearTimeout(timerId.current);
        setState((s: any) => ({
          ...s,
          isProcessing: true,
        }));
        const code = editorRef.current?.getValue() || data.code;

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
  }, [pyodide, pyodideIsLoading, editorValue, namespace]);

  const runParsedCode = React.useCallback(async () => {
    if (pyodide !== null && pyodideIsLoading === false) {
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

        await pyodide?.runPythonAsync(code, { globals: namespace });

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
  }, [pyodide, pyodideIsLoading, boardId, state.execCode, namespace]);

  React.useEffect(() => {
    if (pyodide !== null && pyodideIsLoading === false) {
      execute();
    }
  }, [pyodide, pyodideIsLoading, execute]);

  React.useEffect(() => {
    if (state.stateUpdateCount > 0) {
      runParsedCode();
    }
  }, [state.stateUpdateCount]);

  React.useEffect(() => {
    if (state.executionCount > 0) {
      runParsedCode();
    }
  }, [state.executionCount]);

  React.useEffect(() => {
    if (pyodideIsLoading) {
      setState((s: any) => ({
        ...s,
        isProcessing: true,
      }));
    }
  }, [pyodideIsLoading]);

  React.useEffect(() => {
    setEditorValue(data.code);
    const unsubscribe = pyodideEngine.events.on(
      boardId,
      ({ blocks, components, state, query }) => {
        if (components) {
          setState((s: any) => ({
            ...s,
            layout: {
              blocks: blocks[boardId] ?? [],
              components: components[boardId],
            },
          }));
        }
        if (state || query) {
          setState((s: any) => ({
            ...s,
            stateUpdateCount: s.stateUpdateCount + 1,
          }));
        }
      },
    );
    return () => {
      window.clearTimeout(timerId.current);
      unsubscribe();
      destroyBoardStore();
    };
  }, [boardId]);

  function handleEditorMount(editor: any) {
    editorRef.current = editor;
    editorRef.current?.onKeyDown(onKeyDown);
  }

  function onKeyDown() {
    const updateEditorValue = _.debounce(() => {
      setEditorValue(editorRef.current?.getValue());
    }, 40);

    updateEditorValue();
  }

  function getResizeElementSize() {
    const sizes = JSON.parse(getItem('board-ResizeElement')!);
    return sizes?.height || '200px';
  }

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
      <Box as='section' height='100vh' className='Board'>
        {!previewMode && (
          <TopBar>
            <Box flex='1 100%'>
              <Breadcrumb
                customRouteValues={{
                  [`/boards/${boardId}`]: data.name,
                }}
              />
            </Box>
            {editMode || newMode ? (
              <Box
                className='Board__appBar__controls'
                display='flex'
                ai='center'
                gap='$5'
              >
                <Button
                  color='primary'
                  variant='contained'
                  size='xs'
                  onClick={execute}
                >
                  Run
                </Button>
                <SaveBoard
                  saveBoard={saveBoard}
                  getEditorValue={() => editorRef.current?.getValue() ?? ''}
                  initialState={data}
                />
                <Link
                  css={{ display: 'flex' }}
                  to={PathEnum.Board.replace(
                    ':boardId',
                    newMode ? '' : boardId,
                  )}
                  underline={false}
                >
                  <Button variant='outlined' size='xs'>
                    Cancel
                  </Button>
                </Link>
              </Box>
            ) : (
              <Link
                css={{ display: 'flex' }}
                to={PathEnum.Board_Edit.replace(':boardId', boardId)}
                underline={false}
              >
                <Button variant='outlined' size='xs' rightIcon={<IconPencil />}>
                  Edit
                </Button>
              </Link>
            )}
          </TopBar>
        )}
        <BusyLoaderWrapper
          isLoading={pyodideIsLoading || isLoading}
          height={'100%'}
        >
          <BoardVisualizerContainer className='BoardVisualizer'>
            <BoardVisualizerPane id='BoardVisualizer'>
              {editMode || newMode ? (
                <BoardVisualizerEditorPane className='BoardVisualizer__main__editor'>
                  <Editor
                    language='python'
                    height='100%'
                    value={editorRef.current?.getValue() ?? data.code}
                    onMount={handleEditorMount}
                    loading={<span />}
                    options={{
                      tabSize: 4,
                      useTabStops: true,
                    }}
                  />
                </BoardVisualizerEditorPane>
              ) : null}
              <BoardVisualizerComponentsPane
                className='BoardVisualizer__main__components'
                resizingFallback={<ResizingFallback />}
                loading={state.isProcessing === null}
                processing={state.isProcessing}
                fullWidth={!editMode && !newMode}
              >
                {state.isProcessing !== false && (
                  <BoardSpinner className='BoardVisualizer__main__components__spinner'>
                    <Spinner />
                  </BoardSpinner>
                )}
                {newMode || editMode ? (
                  <>
                    <Box height='100%' css={{ overflow: 'auto' }}>
                      <BoardComponentsViz
                        ref={vizContainer}
                        className='BoardVisualizer__main__components__viz'
                        style={{ marginBottom: getResizeElementSize() }}
                        key={`${state.isProcessing}`}
                      >
                        {state.error ? (
                          <Box
                            as='pre'
                            css={{ fontMono: 14 }}
                            color='$danger100'
                            p='$5'
                          >
                            {state.error}
                          </Box>
                        ) : (
                          renderTree(tree, tree.root.elements)
                        )}
                      </BoardComponentsViz>
                    </Box>
                    {state.isProcessing !== null && (
                      <div ref={boxContainer}>
                        <BoardConsole
                          key={'board-console'}
                          boxContainer={boxContainer}
                          vizContainer={vizContainer}
                        />
                      </div>
                    )}

                    <BoardLeavingGuard data={data.code} />
                  </>
                ) : (
                  <BoardComponentsViz
                    className='BoardVisualizer__main__components__viz'
                    ref={vizContainer}
                    key={`${state.isProcessing}`}
                  >
                    {state.error ? (
                      <Box
                        as='pre'
                        css={{ fontMono: 14 }}
                        color='$danger100'
                        p='$5'
                      >
                        {state.error}
                      </Box>
                    ) : (
                      renderTree(tree, tree.root.elements)
                    )}
                  </BoardComponentsViz>
                )}
              </BoardVisualizerComponentsPane>
            </BoardVisualizerPane>
          </BoardVisualizerContainer>
        </BusyLoaderWrapper>
      </Box>
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

function constructTree(elems: any, tree: any) {
  for (let i = 0; i < elems.length; i++) {
    let elem = elems[i];
    if (elem.element === 'block') {
      if (!elem.parent_block) {
        tree.root.elements[elem.block_context.id] = {
          ...elem.block_context,
          elements: {},
          data: elem.data,
        };
      } else {
        if (!tree.hasOwnProperty(elem.parent_block.id)) {
          tree[elem.parent_block.id] = {
            id: elem.parent_block.id,
            elements: {},
            data: elem.data,
          };
        }
        tree[elem.parent_block.id].elements[elem.block_context.id] = {
          ...elem.block_context,
          elements: {},
          data: elem.data,
        };
      }
      tree[elem.block_context.id] = {
        ...elem.block_context,
        elements: {},
        data: elem.data,
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

    if (element.type === 'tabs') {
      const tabs = [];
      for (const tabIndex in tree[element.id].elements) {
        const tab = tree[element.id].elements[tabIndex];
        tabs.push({
          label: tab.data,
          value: tab.data,
          content: (
            <BoardBlockTab key={element.type + i} className={'block--tab'}>
              {renderTree(tree, tree[tab.id].elements)}
            </BoardBlockTab>
          ),
        });
      }
      return (
        <Box width='100%' key={element.type + i} className={'block--tabs'}>
          <Tabs tabs={tabs} />
        </Box>
      );
    }
    if (element.type === 'tab') {
      return null;
    }

    return <GridCell key={i} viz={element} />;
  });
}
