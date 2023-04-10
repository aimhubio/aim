import * as React from 'react';

import pyodideStore, { loadPyodideInstance } from './pyodide';

function usePyodide() {
  let [isLoading, setIsLoading] = React.useState(pyodideStore.isLoading);
  let [pyodide, setPyodide] = React.useState(pyodideStore.current);
  let namespace = React.useRef(pyodideStore.namespace);

  React.useEffect(() => {
    if (pyodide === null && isLoading === null) {
      setIsLoading(true);
      loadPyodideInstance(() => {
        namespace.current = pyodideStore.namespace;
        setPyodide(pyodideStore.current);
        setIsLoading(false);
      });
    }

    if (pyodide !== null) {
      pyodide._api.fatal_error = async (err: unknown) => {
        console.log('---- fatal error ----', err);
        setPyodide(null);
      };
    }
  }, [pyodide, isLoading]);

  return {
    isLoading,
    pyodide,
    namespace: namespace.current,
    model: pyodideStore.model,
  };
}

export default usePyodide;
