import { getBasePath } from 'config/config';

import { search } from 'pages/Board/search';

import pyodideEngine from './store';

// @ts-ignore
window.search = search;

let layoutUpdateTimer: number;
let prevBoardId: undefined | string;

// @ts-ignore
window.updateLayout = (elements: any, boardId: undefined | string) => {
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

  if (prevBoardId === boardId) {
    window.clearTimeout(layoutUpdateTimer);
  }

  prevBoardId = boardId;

  layoutUpdateTimer = window.setTimeout(() => {
    pyodideEngine.events.fire(
      boardId as string,
      { blocks, components },
      { savePayload: false },
    );
  }, 50);
};

// @ts-ignore
window.setState = (update: any, boardId: undefined | string) => {
  let stateUpdate = update.toJs();
  update.destroy();
  let state = toObject(stateUpdate);

  pyodideEngine.events.fire(
    boardId as string,
    {
      state: state[boardId as string],
    },
    { savePayload: false },
  );
};

export async function loadPyodideInstance() {
  pyodideEngine.setPyodide({
    current: null,
    namespace: null,
    isLoading: true,
  });

  const pyodide = await (window as any).loadPyodide({
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

  const namespace = pyodide.toPy({});
  const mock = await fetch(`${getBasePath()}/static-files/aim_ui_core.py`);
  const mockText = await mock.text();

  await pyodide.runPythonAsync(mockText, { globals: namespace });

  pyodideEngine.setPyodide({
    current: pyodide,
    namespace,
    isLoading: false,
  });
}

export async function loadPandas() {
  const pyodide = pyodideEngine.getPyodideCurrent();
  await pyodide.loadPackage('pandas');
}

export async function loadPlotly() {
  const pyodide = pyodideEngine.getPyodideCurrent();
  await pyodide.loadPackage('micropip');
  try {
    const micropip = pyodide.pyimport('micropip');
    await micropip.install('plotly');
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log(ex);
  }
}

// @ts-ignore
window.pyodideEngine = pyodideEngine;

const toObjectDict = {
  [Map.name]: (x: Map<any, any>) =>
    Object.fromEntries(Array.from(x.entries(), ([k, v]) => [k, toObject(v)])),
  [Array.name]: (x: Array<any>) => x.map(toObject),
};
function toObject(x: any): any {
  const cb = toObjectDict[x?.constructor.name];
  if (cb) {
    return cb(x);
  }
  return x;
}
