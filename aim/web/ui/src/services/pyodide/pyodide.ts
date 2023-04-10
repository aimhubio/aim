import { debounce } from 'lodash-es';

import { getBasePath } from 'config/config';

import { search } from 'pages/Board/search';

import createModel from 'services/models/model';

let pyodideStore: any = {
  current: null,
  isLoading: null,
  namespace: null,
  model: createModel({
    blocks: {},
    components: {},
    state: {},
  }),
};

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

(window as any).search = search;

let layoutUpdateTimer: number;

(window as any).updateLayout = (elements: any, boardId: undefined | string) => {
  let layout = toObject(elements.toJs());
  elements.destroy();

  let blocks: Record<string, any[]> = {};
  let components: Record<string, any[]> = {};

  for (let item of layout) {
    let boardId = item.board_id;
    if (!blocks.hasOwnProperty(boardId)) {
      blocks[boardId] = [];
      components[boardId] = [];
    }
    if (item.element === 'block') {
      blocks[boardId].push(item);
    } else {
      components[boardId].push(item);
    }
  }

  window.clearTimeout(layoutUpdateTimer);
  layoutUpdateTimer = window.setTimeout(() => {
    pyodideStore.model.emit(boardId, {
      blocks,
      components,
    });
  }, 50);
};

(window as any).setState = (update: any, boardId: undefined | string) => {
  let stateUpdate = update.toJs();
  update.destroy();
  let state = toObject(stateUpdate);

  pyodideStore.model.emit(boardId, { state: state[boardId as string] });
};

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
      console.log(...args);
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
