import React from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash-es';

import Editor from '@monaco-editor/react';

import { Spinner } from 'components/kit';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ResizingFallback from 'components/ResizingFallback';
import { Box, Button, Link, Tabs } from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';

import { search } from 'pages/Board/serverAPI/search';

import usePyodide from 'services/pyodide/usePyodide';
import pyodideEngine from 'services/pyodide/store';
import {
  getQueryResultsCacheMap,
  clearQueryResultsCache,
  clearPendingQueriesMap,
  resetBoardState,
} from 'services/pyodide/pyodide';

// import SaveBoard from './components/SaveBoard';
import GridCell from './components/GridCell';
// import BoardLeavingGuard from './components/BoardLeavingGuard';
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
import FormVizElement from './components/VisualizationElements/FormVizElement';
import useBoardStore from './BoardStore';

const liveUpdateEnabled = false;
const liveUpdateInterval = 5000;

function Board({
  data,
  isLoading = false,
  editMode,
  newMode,
  notifyData,
  onNotificationDelete,
  stateStr,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const [mounted, setMounted] = React.useState(false);
  const {
    isLoading: pyodideIsLoading,
    pyodide,
    namespace,
    registeredPackages,
  } = usePyodide();

  const editorRef = React.useRef<any>(null);
  const vizContainer = React.useRef<HTMLDivElement>(
    document.createElement('div'),
  );
  const boxContainer = React.useRef<HTMLDivElement>(
    document.createElement('div'),
  );
  const tobBarRef = React.useRef<HTMLDivElement>(
    document.querySelector('#app-top-bar'),
  );
  const setEditorValue = useBoardStore((state) => state.setEditorValue);

  const boardPath = data.path;

  const timerId = React.useRef(0);

  let liveUpdateTimersRef = React.useRef<Record<string, number>>({});
  let queryKeysForCacheCleaningRef = React.useRef<Record<string, boolean>>({});

  function clearDataCache() {
    clearQueryResultsCache();
    for (let queryKey in liveUpdateTimersRef.current) {
      window.clearTimeout(liveUpdateTimersRef.current[queryKey]);
    }
  }

  const [state, setState] = React.useState<any>({
    layoutTree: null,
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
        clearDataCache();
        setState((s: any) => ({
          ...s,
          isProcessing: true,
        }));
        const code = editorRef.current?.getValue() || data.code || '';

        const packagesListProxy = pyodide?.pyodide_py.code.find_imports(code);
        const packagesList = packagesListProxy.toJs();
        packagesListProxy.destroy();

        for await (const lib of packagesList) {
          if (!registeredPackages.concat(['js']).includes(lib)) {
            await pyodide?.loadPackage('micropip');
            try {
              const micropip = pyodide?.pyimport('micropip');
              await micropip.install(lib);
            } catch (ex) {
              // eslint-disable-next-line no-console
              console.warn(ex);
            }
          }
        }

        await pyodide?.loadPackagesFromImports(code);

        setState((s: any) => ({
          ...s,
          layoutTree: null,
          execCode: code,
          executionCount: s.executionCount + 1,
        }));
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.warn(ex);
      }
    }
  }, [pyodide, pyodideIsLoading, data.code, namespace, registeredPackages]);

  const runParsedCode = React.useCallback(async () => {
    if (pyodide !== null && pyodideIsLoading === false) {
      try {
        let resetCode = `viz_map_keys = {}
block_context = {
  "current": 0,
}

current_layout = []

board_path = ${boardPath === undefined ? 'None' : `"${boardPath}"`}

if len(${JSON.stringify(stateStr)}) > 0:
  if board_path not in state:
    state[board_path] = {}

  state[board_path].update(json.loads(${JSON.stringify(stateStr)}))

session_state = state[board_path] if board_path in state else {}
def set_session_state(state_slice):
  set_state(state_slice, board_path)
`;
        for (let queryKey in queryKeysForCacheCleaningRef.current) {
          if (queryKeysForCacheCleaningRef.current[queryKey]) {
            resetCode += `query_results_cache.pop(${JSON.stringify(
              queryKey,
            )}, None)
`;
            queryKeysForCacheCleaningRef.current[queryKey] = false;
          }
        }

        pyodide?.runPython(resetCode, { globals: namespace });
        await pyodide?.runPythonAsync(state.execCode, { globals: namespace });

        setState((s: any) => ({
          ...s,
          error: null,
          isProcessing: false,
        }));
      } catch (ex: any) {
        if (ex.type === 'WaitForQueryError') {
          return;
        }
        if (ex.message.includes('WAIT_FOR_QUERY_RESULT')) {
          return;
        }
        // eslint-disable-next-line no-console
        console.warn(ex);
        setState((s: any) => ({
          ...s,
          error: ex.message,
          isProcessing: false,
        }));
      }
    }
  }, [
    pyodide,
    pyodideIsLoading,
    boardPath,
    state.execCode,
    namespace,
    stateStr,
  ]);

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
    runParsedCode();
  }, [stateStr]);

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
    const unsubscribeFromBoardUpdates = pyodideEngine.events.on(
      boardPath,
      ({ layoutTree, state, queryKey, runFunctionKey }) => {
        if (layoutTree) {
          setState((s: any) => ({
            ...s,
            layoutTree,
          }));
        }
        if (state || queryKey || runFunctionKey) {
          setState((s: any) => ({
            ...s,
            stateUpdateCount: s.stateUpdateCount + 1,
          }));
        }

        if (liveUpdateEnabled && queryKey) {
          if (liveUpdateTimersRef.current.hasOwnProperty(queryKey)) {
            window.clearTimeout(liveUpdateTimersRef.current[queryKey]);
          }

          liveUpdateTimersRef.current[queryKey] = window.setTimeout(() => {
            if (!getQueryResultsCacheMap().has(queryKey)) {
              return;
            }
            const {
              boardPath: queryBoardPath,
              type_,
              query,
              count,
              start,
              stop,
              isSequence,
            } = getQueryResultsCacheMap().get(queryKey).params;

            try {
              getQueryResultsCacheMap().delete(queryKey);
              search(
                queryBoardPath,
                type_,
                query,
                count,
                start,
                stop,
                isSequence,
                () => {
                  queryKeysForCacheCleaningRef.current[queryKey] = true;
                },
              );
            } catch (ex) {
              if (ex === 'WAIT_FOR_QUERY_RESULT') {
                return;
              }
              // eslint-disable-next-line no-console
              console.warn(ex);
            }
          }, liveUpdateInterval);
        }
      },
    );

    return () => {
      window.clearTimeout(timerId.current);
      clearDataCache();
      if (editorRef.current) {
        editorRef.current = null;
      }
      unsubscribeFromBoardUpdates();
      clearPendingQueriesMap(boardPath);
      resetBoardState(boardPath);
    };
  }, [boardPath]);

  React.useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
  }, [mounted]);

  function handleEditorMount(editor: any) {
    editorRef.current = editor;
    if (editorRef.current) {
      editorRef.current?.onKeyDown(updateEditorValue);
    }
  }

  const updateEditorValue = _.debounce(() => {
    setEditorValue(editorRef.current?.getValue());
  }, 1000);

  return (
    <ErrorBoundary>
      <Box as='section' height='100vh' className='Board'>
        {(editMode || newMode) &&
          tobBarRef.current &&
          createPortal(
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
              {/* <SaveBoard
                saveBoard={saveBoard}
                getEditorValue={() => editorRef.current?.getValue() ?? ''}
                initialState={data}
              /> */}
              <Link
                css={{ display: 'flex' }}
                to={`${PathEnum.App}/${boardPath}`}
                underline={false}
              >
                <Button variant='outlined' size='xs'>
                  Cancel
                </Button>
              </Link>
            </Box>,
            tobBarRef.current,
          )}
        <BusyLoaderWrapper
          isLoading={pyodideIsLoading || isLoading || !mounted}
          height='100%'
        >
          <BoardVisualizerContainer className='BoardVisualizer'>
            <BoardVisualizerPane
              id='BoardVisualizer'
              useLocalStorage={true}
              sizes={(editMode || newMode) && mounted ? [40, 60] : [0, 100]}
            >
              {(editMode || newMode) && mounted ? (
                <BoardVisualizerEditorPane className='BoardVisualizer__main__editor'>
                  <Editor
                    language='python'
                    height='100%'
                    value={editorRef.current?.getValue() ?? (data.code || '')}
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
                <Box height='100%' css={{ overflow: 'auto' }}>
                  <BoardComponentsViz
                    ref={vizContainer}
                    className='BoardVisualizer__main__components__viz'
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
                      state.layoutTree &&
                      renderTree(
                        state.layoutTree,
                        state.layoutTree.get('root').elements,
                      )
                    )}
                  </BoardComponentsViz>
                </Box>
                {(newMode || editMode) && state.isProcessing !== null && (
                  <div className='BoardConsole__container' ref={boxContainer}>
                    <BoardConsole
                      key={'board-console'}
                      boxContainer={boxContainer}
                      vizContainer={vizContainer}
                    />
                  </div>
                )}

                {/* <BoardLeavingGuard data={data.code} /> */}
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

function renderTree(tree: any, elements: any) {
  if (elements.size === 0) {
    return null;
  }
  return [...elements].map(([key, element]) => {
    if (element.type === 'row' || element.type === 'column') {
      return (
        <div key={element.type + key} className={`block--${element.type}`}>
          {renderTree(tree, tree.get(element.id).elements)}
        </div>
      );
    }

    if (element.type === 'tabs') {
      const tabs = [];
      for (const tabIndex of tree.get(element.id).elements.keys()) {
        const tab = tree.get(element.id).elements.get(tabIndex);
        tabs.push({
          label: tab.data,
          value: tab.data,
          content: (
            <BoardBlockTab key={element.type + key} className={'block--tab'}>
              {renderTree(tree, tree.get(tab.id).elements)}
            </BoardBlockTab>
          ),
        });
      }
      return (
        <Box key={element.type + key} className='block--tabs'>
          <Tabs tabs={tabs} />
        </Box>
      );
    }

    if (element.type === 'tab') {
      return null;
    }

    if (element.type === 'form') {
      return (
        <FormVizElement key={element.type + key} {...element}>
          {renderTree(tree, tree.get(element.id).elements)}
        </FormVizElement>
      );
    }

    if (element.type === 'table_cell') {
      return null;
    }

    if (element.type === 'Table' && element.options.with_renderer) {
      const vizData: Record<string, any[]> = {};
      for (let col in element.data) {
        vizData[col] = [];
        for (let i = 0; i < element.data[col].length; i++) {
          if (element.data[col][i]?.type) {
            vizData[col][i] = <GridCell key={i} viz={element.data[col][i]} />;
          } else {
            vizData[col][i] = element.data[col][i];
          }
        }
      }

      return (
        <GridCell
          key={key}
          viz={{
            ...element,
            data: vizData,
          }}
        />
      );
    }

    return <GridCell key={key} viz={element} />;
  });
}
