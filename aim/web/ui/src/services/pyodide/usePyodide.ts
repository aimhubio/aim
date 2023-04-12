import * as React from 'react';

import pyodideStore, { loadPyodideInstance } from './pyodide';

function usePyodide() {
  let namespace = React.useRef(pyodideStore.namespace);
  let [state, setState] = React.useState({
    pyodide: pyodideStore.current,
    isLoading: pyodideStore.isLoading,
  });

  const loadPyodide = React.useCallback(() => {
    if (state.pyodide === null && state.isLoading === null) {
      setState((s) => ({
        ...s,
        isLoading: true,
      }));
      loadPyodideInstance(() => {
        namespace.current = pyodideStore.namespace;

        setState({
          pyodide: pyodideStore.current,
          isLoading: false,
        });
      });
    }

    if (state.pyodide !== null) {
      state.pyodide._api.fatal_error = async (err: unknown) => {
        console.log('---- fatal error ----', err);
        setState((s) => ({
          ...s,
          pyodide: null,
        }));
      };
    }
  }, [state.pyodide, state.isLoading]);

  return {
    isLoading: state.isLoading,
    pyodide: state.pyodide,
    namespace: namespace.current,
    model: pyodideStore.model,
    loadPyodide,
  };
}

export default usePyodide;
