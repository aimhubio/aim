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
  const { pyodide, code, readOnly } = props;

  const editorValue = React.useRef(code);
  const editorRef = React.useRef<any>();

  const [result, setResult] = React.useState<Record<string, any>>([[]]);
  const [isProcessing, setIsProcessing] = React.useState<boolean | null>(null);
  const [editorHeight, setEditorHeight] = React.useState(lineHeight);
  const [error, setError] = React.useState<string | null>(null);
  const [reprValue, setReprValue] = React.useState<any>(null);

  const execute = React.useCallback(async () => {
    try {
      (window as any).updateCellLayout = (grid: any) => {
        setResult(toObject(grid.toJs()));
      };

      const layoutUpdateCode = `from js import updateCellLayout
def Grid(grid):
    updateCellLayout(grid)
`;

      setIsProcessing(true);
      const code = layoutUpdateCode.concat(
        editorValue.current
          .replaceAll('= Metric.query', '= await Metric.query')
          .replaceAll('= Images.query', '= await Images.query')
          .replaceAll('= Audios.query', '= await Audios.query')
          .replaceAll('= Figures.query', '= await Figures.query')
          .replaceAll('= Texts.query', '= await Texts.query')
          .replaceAll('= Distributions.query', '= await Distributions.query')
          .replaceAll('def ', 'async def ')
          .replaceAll('async async def ', 'async def '),
      );
      const packagesList = pyodide.current.pyodide_py.find_imports(code).toJs();

      if (packagesList.includes('plotly')) {
        await pyodide.current.loadPackage('micropip');
        const micropip = pyodide.current.pyimport('micropip');
        await micropip.install('plotly');
      }

      await pyodide.current!.loadPackagesFromImports(code);
      pyodide.current
        .runPythonAsync(code)
        .then((val: any) => {
          setReprValue(toObject(val));
          setError(null);
          setIsProcessing(false);
        })
        .catch((ex: Error) => {
          setError(ex.message);
          setIsProcessing(false);
        });
    } catch (ex) {
      console.log(ex);
    }
  }, [editorValue]);

  function handleDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    setEditorHeight((editor?.getModel()?.getLineCount() ?? 1) * lineHeight);
  }

  function handleChange(
    val: string | undefined,
    ev: monacoEditor.editor.IModelContentChangedEvent,
  ) {
    editorValue.current = val!;
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
      ) : reprValue ? (
        <pre className='NotebookCell__repr'>{reprValue}</pre>
      ) : (
        <div className='NotebookCell__grid'>
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
                  <GridCell
                    key={i}
                    viz={viz}
                    maxWidth={`${100 / row.length}%`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(NotebookCell);
