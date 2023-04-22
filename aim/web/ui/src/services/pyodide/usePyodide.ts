import * as React from 'react';

import { loadPyodideInstance } from './pyodide';
import pyodideEngine, { usePyodideEngine } from './store';

function usePyodide() {
  const namespace = usePyodideEngine(pyodideEngine.pyodideNamespaceSelector);
  const pyodide = usePyodideEngine(pyodideEngine.pyodideCurrentSelector);
  const isLoading = usePyodideEngine(pyodideEngine.pyodideIsLoadingSelector);

  const loadPyodide = React.useCallback(() => {
    if (pyodide !== null) {
      pyodide._api.fatal_error = async (err: unknown) => {
        console.log('---- fatal error ----', err);
        pyodideEngine.setPyodideCurrent(null);
      };
    }

    if (pyodide === null && isLoading === null) {
      loadPyodideInstance();
    }
  }, [pyodide, isLoading]);

  return {
    namespace,
    isLoading,
    pyodide,
    loadPyodide,
  };
}

export default usePyodide;
