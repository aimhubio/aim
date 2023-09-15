import * as React from 'react';
import * as _ from 'lodash-es';

import pyodideEngine from 'services/pyodide/store';

import { LoadingBarStyled } from '../Board.style';

function LoadingBar({ boardPath }: { boardPath: string }) {
  const [progress, setProgress] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (!_.isEmpty(progress)) {
      let progressTimer = setTimeout(() => {
        setProgress((oldProgress) => {
          let newProgress: Record<string, number> = {};
          for (let key in oldProgress) {
            if (oldProgress[key] === 100) {
              continue;
            }

            if (oldProgress[key] >= 90) {
              newProgress[key] = 90;
            } else {
              newProgress[key] = oldProgress[key] + 10 * Math.random();
            }
          }

          return newProgress;
        });
      }, 200);

      return () => clearTimeout(progressTimer);
    }
  }, [progress]);

  React.useEffect(() => {
    if (boardPath) {
      const unsubscribeFromBoardUpdates = pyodideEngine.events.on(
        boardPath,
        ({
          queryDispatchedKey,
          runActionDispatchedKey,
          queryKey,
          runActionKey,
        }) => {
          setProgress((oldProgress) => {
            let newProgress: Record<string, number> = {};
            if (queryDispatchedKey) {
              newProgress[queryDispatchedKey] = 0;
            }

            if (runActionDispatchedKey) {
              newProgress[runActionDispatchedKey] = 0;
            }

            if (queryKey) {
              newProgress[queryKey] = 100;
            }

            if (runActionKey) {
              newProgress[runActionKey] = 100;
            }

            return {
              ...oldProgress,
              ...newProgress,
            };
          });
        },
      );

      return () => {
        unsubscribeFromBoardUpdates();
      };
    }
  }, [boardPath]);

  return (
    <LoadingBarStyled
      style={
        _.isEmpty(progress)
          ? {
              width: 0,
              opacity: 0,
            }
          : {
              width: `${Math.min(...Object.values(progress))}%`,
              opacity: 1,
            }
      }
    />
  );
}

export default LoadingBar;
