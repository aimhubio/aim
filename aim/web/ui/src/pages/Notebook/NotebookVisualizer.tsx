import * as React from 'react';
import * as _ from 'lodash-es';
import classnames from 'classnames';

import Editor from '@monaco-editor/react';

import { Button, Spinner } from 'components/kit';

import { getBasePath } from 'config/config';

import { search } from 'pages/Sandbox/search';

(window as any).search = search;

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
  const pyodide = React.useRef<any>();

  const editorValue = React.useRef('');
  const [result, setResult] = React.useState<Record<string, any>>([[]]);
  const [isProcessing, setIsProcessing] = React.useState<boolean | null>(null);

  (window as any).updateLayout = (grid: any) => {
    setResult(toObject(grid.toJs()));
  };

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

  return <div className='NotebookVisualizer'></div>;
}
