import { noop } from 'lodash-es';

import { getBasePath } from 'config/config';

import { search } from 'pages/Board/search';

let pyodideStore: any = {
  current: null,
  isLoading: null,
  namespace: null,
};

(window as any).search = search;
(window as any).updateLayout = noop;

export async function loadPyodideInstance(cb?: Function) {
  pyodideStore.current = null;
  pyodideStore.namespace = null;
  pyodideStore.current = await (window as any).loadPyodide({
    stdout: (...args: any[]) => {
      window.requestAnimationFrame(() => {
        const terminal = document.getElementById('console');
        if (terminal) {
          terminal.innerHTML! += `<p>${args.join(', ')}</p>`;
          terminal.scrollTop = terminal.scrollHeight;
        }
      });
    },
    stderr: (...args: any[]) => {
      console.log('err', args);
    },
  });

  let namespace = pyodideStore.current.toPy({});

  pyodideStore.namespace = namespace;

  await pyodideStore.current.loadPackage('pandas');

  await pyodideStore.current.runPythonAsync(
    await (await fetch(`${getBasePath()}/static-files/aim_ui_core.py`)).text(),
    { globals: pyodideStore.namespace },
  );

  pyodideStore.isLoading = false;

  if (cb) {
    cb();
  }
}

export default pyodideStore;
