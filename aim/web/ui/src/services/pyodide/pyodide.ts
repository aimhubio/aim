import { noop, cloneDeep } from 'lodash-es';

import { getBasePath } from 'config/config';

import { search } from 'pages/Board/search';

let pyodideStore: any = {
  current: null,
  isLoading: null,
  namespace: null,
  isRunnning: false,
  exec: noop,
  queue: [],
  format: function formatter(data: any): any {
    if (data instanceof Map) {
      return Object.fromEntries(
        Array.from(data.entries(), ([k, v]) => [k, formatter(data)]),
      );
    } else if (data instanceof Array) {
      return data.map(formatter);
    } else {
      return data;
    }
  },
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
        } else {
          console.log(...args);
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

  pyodideStore.exec = async (code: string) => {
    if (pyodideStore.isRunnning) {
      pyodideStore.queue.unshift(code);
    } else {
      pyodideStore.isRunnning = true;
      await pyodideStore.current.runPythonAsync(code, {
        globals: pyodideStore.current.toPy(
          cloneDeep(pyodideStore.namespace.toJs()),
        ),
      });
      console.log(pyodideStore.queue);
      pyodideStore.isRunnning = false;
      if (pyodideStore.queue.length > 0) {
        let nextCode = pyodideStore.queue.pop();
        await pyodideStore.exec(nextCode);
      }
    }
  };

  pyodideStore.isLoading = false;

  if (cb) {
    cb();
  }
}

export default pyodideStore;
