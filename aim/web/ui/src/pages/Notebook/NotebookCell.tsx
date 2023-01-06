import * as React from 'react';
import classnames from 'classnames';
import * as monacoEditor from 'monaco-editor';

import Editor from '@monaco-editor/react';

import { Button, Icon, Spinner, Text } from 'components/kit';

import GridCell from 'pages/Sandbox/GridCell';

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

let lineHeight = 18;

function NotebookCell(props: any) {
  const { pyodide, namespace, isLoading, code, readOnly, index, editCellCode } =
    props;

  const editorValue = React.useRef(code);
  const editorRef = React.useRef<any>();

  const [result, setResult] = React.useState([[]]);
  const [editorHeight, setEditorHeight] = React.useState(lineHeight);
  const [error, setError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState<boolean | null>(null);
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
    }, 50);
  };

  (window as any).setState = (update: any) => {
    let stateUpdate = update.toJs();
    update.destroy();
    setState((s: any) => ({
      ...s,
      ...toObject(stateUpdate),
    }));
  };
  (window as any).state = state;
  (window as any).view = result;

  const execute = React.useCallback(async () => {
    try {
      setIsProcessing(true);
      const code = editorValue.current
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

      await pyodide.loadPackagesFromImports(code);

      (window as any).search.cache.clear();
      (window as any).state = undefined;
      (window as any).view = [[]];

      setState(undefined);
      setResult([[]]);
      setExecCode(code);
      setExecutionCount((eC) => eC + 1);
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
    }
  }, [editorValue]);

  // React.useEffect(() => {
  //   if (pyodide !== null) {
  //     execute();
  //   }
  // }, [pyodide, execute]);

  const runParsedCode = React.useCallback(() => {
    if (pyodide !== null) {
      try {
        let vizMapResetCode = `viz_map_keys = {}
`;
        pyodide?.runPython(vizMapResetCode, { globals: namespace });
        pyodide
          ?.runPythonAsync(execCode, { globals: namespace })
          .then(() => {
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
      (window as any).state = undefined;
      (window as any).view = [[]];
      runParsedCode();
    }
  }, [executionCount]);

  React.useEffect(() => {
    if (state !== undefined) {
      (window as any).state = state;
      (window as any).view = result;
      runParsedCode();
    }
  }, [state]);

  React.useEffect(() => {
    setIsProcessing(isLoading);
  }, [isLoading]);

  React.useEffect(() => {
    return () => window.clearTimeout(timerId.current);
  }, []);

  function handleDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    setEditorHeight((editor?.getModel()?.getLineCount() ?? 1) * lineHeight);
  }

  function handleChange(
    val: string | undefined,
    ev: monacoEditor.editor.IModelContentChangedEvent,
  ) {
    editorValue.current = val!;
    editCellCode(index, editorValue.current);
    setEditorHeight(
      (editorRef.current.getModel().getLineCount() ?? 1) * lineHeight,
    );
  }

  return (
    <div className='NotebookCell'>
      <div
        className={classnames('NotebookCell__editor', {
          'NotebookCell__editor--readOnly': readOnly,
        })}
      >
        <Editor
          language='python'
          height={editorHeight}
          value={editorValue.current}
          onMount={handleDidMount}
          onChange={handleChange}
          loading={<span />}
          options={{
            tabSize: 4,
            useTabStops: true,
            automaticLayout: true,
            minimap: { enabled: false },
            scrollbar: {
              horizontal: 'hidden',
              vertical: 'hidden',
              verticalSliderSize: 0,
            },
            scrollBeyondLastLine: false,
            readOnly,
          }}
        />
        {!readOnly && (
          <Button
            onClick={execute}
            size='xSmall'
            className='NotebookCell__editor__runButton'
            disabled={!!isProcessing}
          >
            {isProcessing ? <Spinner size={12} /> : <Icon name='play' />}
            <Text className='NotebookCell__editor__runButton__text'>Run</Text>
          </Button>
        )}
      </div>
      {error ? (
        <pre className='NotebookCell__error'>{error}</pre>
      ) : result.flat().length > 0 ? (
        <div className='NotebookCell__grid'>
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
                  {row.map(
                    (viz: any, i: number) =>
                      viz && (
                        <GridCell
                          key={i}
                          viz={viz}
                          maxWidth={`${100 / row.length}%`}
                        />
                      ),
                  )}
                </div>
              ),
          )}
        </div>
      ) : null}
    </div>
  );
}

export default React.memo(NotebookCell);
