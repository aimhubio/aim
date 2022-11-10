import { getBasePath } from 'config/config';

let pyodideStore: any = {
  current: null,
  isLoading: null,
};

export async function loadPyodideInstance(cb?: Function) {
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
  });

  await pyodideStore.current.loadPackage('pandas');

  await pyodideStore.current.runPythonAsync(
    await (await fetch(`${getBasePath()}/static-files/aim_ui_core.py`)).text(),
  );

  pyodideStore.isLoading = false;

  if (cb) {
    cb();
  }
}

export default pyodideStore;
