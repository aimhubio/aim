import * as React from 'react';

import pyodideStore, { loadPyodideInstance } from './pyodide';

function usePyodide() {
  let [isLoading, setIsLoading] = React.useState(pyodideStore.isLoading);
  let [pyodide, setPyodide] = React.useState(pyodideStore.current);
  let namespace = React.useRef(pyodideStore.namespace);
  let isInit = React.useRef(true);

  React.useEffect(() => {
    if (pyodide === null && isLoading === null) {
      setIsLoading(true);
      loadPyodideInstance(() => {
        namespace.current = pyodideStore.namespace;
        setPyodide(pyodideStore.current);
        setIsLoading(false);
        isInit.current = false;
      }, !isInit.current);
    }
  }, [pyodide, isLoading]);

  return {
    isLoading,
    reload: () => {
      setIsLoading(null);
      setPyodide(null);
    },
    pyodide,
    namespace: namespace.current,
  };
}

export default usePyodide;
