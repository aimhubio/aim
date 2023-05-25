import { getBasePath } from 'config/config';

import { fetchPackages } from 'modules/core/api/projectApi';

import { search } from 'pages/Board/search';

import { getItem, setItem } from 'utils/storage';

import pyodideEngine from './store';

// @ts-ignore
window.search = search;

let layoutUpdateTimer: number;
let prevBoardPath: undefined | string;

// @ts-ignore
window.updateLayout = (elements: any, boardPath: undefined | string) => {
  let layout = toObject(elements.toJs());
  elements.destroy();

  console.log(layout, boardPath);

  let blocks: Record<string, any[]> = {};
  let components: Record<string, any[]> = {};

  for (let item of layout) {
    let boardPath = item.board_path;
    if (!blocks.hasOwnProperty(boardPath)) {
      blocks[boardPath] = [];
      components[boardPath] = [];
    }
    if (item.element === 'block') {
      blocks[boardPath].push(item);
    } else {
      if (item.parent_block?.type === 'table_cell') {
        let tabelCell = null;
        for (let elem of blocks[boardPath]) {
          if (elem.block_context.id === item.parent_block.id) {
            tabelCell = elem;
          }
        }

        if (tabelCell) {
          for (let elem of layout) {
            if (elem.key === tabelCell.options.table) {
              elem.data[tabelCell.options.column][tabelCell.options.row] = item;
            }
          }
        }
      }

      components[boardPath].push(item);
    }
  }

  if (prevBoardPath === boardPath) {
    window.clearTimeout(layoutUpdateTimer);
  }

  prevBoardPath = boardPath;

  layoutUpdateTimer = window.setTimeout(() => {
    pyodideEngine.events.fire(
      boardPath as string,
      { blocks, components },
      { savePayload: false },
    );
  }, 50);
};

// @ts-ignore
window.setState = (update: any, boardPath: string, persist = false) => {
  let stateUpdate = update.toJs();
  update.destroy();
  let state = toObject(stateUpdate);

  // This section add persistence for state through saving it to URL and localStorage

  if (persist) {
    const stateStr = JSON.stringify(state);
    const boardStateStr = JSON.stringify(state[boardPath]);
    const prevStateStr = getItem('app_state');

    if (stateStr !== prevStateStr) {
      setItem('app_state', stateStr);
      const url = new URL(window.location as any);
      url.searchParams.set('state', boardStateStr);
      window.history.pushState({}, '', url as any);
    }
  }

  pyodideEngine.events.fire(
    boardPath as string,
    {
      state: state[boardPath],
    },
    { savePayload: false },
  );
};

export async function loadPyodideInstance() {
  pyodideEngine.setPyodide({
    current: null,
    namespace: null,
    isLoading: true,
    registeredPackages: [],
  });
  // @ts-ignore
  const pyodide = await window.loadPyodide({
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
  const coreFile = await fetch(`${getBasePath()}/static-files/aim_ui_core.py`);
  const coreCode = await coreFile.text();
  pyodide.runPython(coreCode, { globals: namespace });

  const availablePackages = await fetchPackages();

  Object.keys(availablePackages).forEach((packageName) => {
    let packageData = availablePackages[packageName];

    let jsModule: Record<string, {}> = {};
    packageData.sequences.forEach((sequenceName: string) => {
      let dataTypeName = sequenceName.slice(`${packageName}.`.length);

      jsModule[dataTypeName] = {
        filter: (query: string) => {
          let val = pyodide.runPython(
            `query_filter('${sequenceName}', ${JSON.stringify(query)})`,
            { globals: namespace },
          );
          return val;
        },
      };
    });

    packageData.containers.forEach((containerName: string) => {
      let dataTypeName = containerName.slice(`${packageName}.`.length);

      jsModule[dataTypeName] = {
        filter: (query: string) => {
          let val = pyodide.runPython(
            `query_filter('${containerName}', ${JSON.stringify(query)})`,
            { globals: namespace },
          );
          return val;
        },
      };
    });

    pyodide.registerJsModule(packageName, jsModule);
  });

  pyodideEngine.setPyodide({
    current: pyodide,
    namespace,
    isLoading: false,
    registeredPackages: Object.keys(availablePackages),
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
  return cb ? cb(x) : x;
}
