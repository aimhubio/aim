import * as React from 'react';

import pyodideStore, { loadPyodideInstance } from './pyodide';

function usePyodide() {
  let [isLoading, setIsLoading] = React.useState(pyodideStore.isLoading);
  let [pyodide, setPyodide] = React.useState(pyodideStore.current);

  React.useEffect(() => {
    if (pyodide === null && isLoading === null) {
      setIsLoading(true);
      loadPyodideInstance(() => {
        setPyodide(pyodideStore.current);
        setIsLoading(false);
      });
    }
  }, [pyodide, isLoading]);

  return { isLoading, pyodide };
}

export default usePyodide;
