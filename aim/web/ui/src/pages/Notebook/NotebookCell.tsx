import * as React from 'react';

import Editor from '@monaco-editor/react';

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

function NotebookCell(props: any) {
  const editorValue = React.useRef('');
  const pyodide = props.pyodide;

  const [result, setResult] = React.useState<Record<string, any>>([[]]);
  const [isProcessing, setIsProcessing] = React.useState<boolean | null>(null);

  (window as any).updateLayout = (grid: any) => {
    setResult(toObject(grid.toJs()));
  };

  const execute = React.useCallback(async () => {
    try {
      setIsProcessing(true);
      const code = editorValue.current
        .replaceAll('= Metric.query', '= await Metric.query')
        .replaceAll('= Images.query', '= await Images.query')
        .replaceAll('= Audios.query', '= await Audios.query')
        .replaceAll('= Figures.query', '= await Figures.query')
        .replaceAll('= Texts.query', '= await Texts.query')
        .replaceAll('= Distributions.query', '= await Distributions.query')
        .replaceAll('def ', 'async def ')
        .replaceAll('async async def ', 'async def ');
      const packagesList = pyodide.current.pyodide_py.find_imports(code).toJs();

      if (packagesList.includes('plotly')) {
        await pyodide.current.loadPackage('micropip');
        const micropip = pyodide.current.pyimport('micropip');
        await micropip.install('plotly');
      }

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
  );
}

export default React.memo(NotebookCell);
