import * as React from 'react';
import * as _ from 'lodash-es';
import classnames from 'classnames';

import { Button, Spinner } from 'components/kit';

import { getBasePath } from 'config/config';

import { search } from 'pages/Sandbox/search';

(window as any).search = search;

export default function SandboxVisualizer() {
  const pyodide = React.useRef<any>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  (window as any).updateLayout = () => {};

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

      setIsLoading(false);
    }
    main();
  }, []);

  return (
    <div className='NotebookVisualizer'>{isLoading ? <Spinner /> : null}</div>
  );
}
