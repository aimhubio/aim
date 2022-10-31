import type { Action, History, Listener, Update } from 'history';

import history from 'history/browser';

import { decode } from 'utils/encoder/encoder';

type ActionType = `${Action}`;

function createListener<T>(
  param: string,
  listener: (data: T | null) => void,
  ignoreActions: ActionType[] = [],
): Listener {
  let latest: string | null = new URLSearchParams(history.location.search).get(
    param,
  );
  return (update: Update) => {
    const searchParams = new URLSearchParams(update.location.search);
    const current = searchParams.get(param);

    if (ignoreActions.length) {
      if (ignoreActions.includes(update.action)) {
        latest = current;
        return;
      }
    }

    if (latest !== current) {
      if (current) {
        listener(JSON.parse(decode(current)));
      } else {
        listener(null);
      }
      latest = current;
    }
  };
}

function listenSearchParam<T>(
  param: string,
  listener: (data: T | null) => void,
  ignoreActions: ActionType[] = [],
) {
  return history.listen(createListener<T>(param, listener, ignoreActions));
}

declare interface BrowserHistory extends History {
  /**
   * function listenSearchParam
   * @description Use function when you need to only listen to a specific url search param change
   *  <pre>
   *     import browserHistory = 'modules/core/services/browserHistory';
   *
   *     const unregister = browserHistory.listenSearchParam('x', (data) => {
   *         console.log(data);
   *     }, ['PUSH']);
   *
   *
   *     browserHistory.push(`?x=${encode({test: true})}`, null); // this will not trigger the update, since ignored PUSH action
   *     browserHistory.back() // will call the listener and will pass `null` as data
   *     browserHistory.forward() // will call the listener and will pass {test: true} as data
   *
   *     unregister() // remove listener
   *  </pre>
   * @param {String} param - search param to listen for changes
   * @param {<T>(data: T | null) => void} listener - callback to call when param changed
   * @param {ActionType[]} ignoreActions - ignore actions ['PUSH', 'POP', 'REPLACE']
   */
  listenSearchParam<T>(
    param: string,
    listener: (data: T | null) => void,
    ignoreActions?: ActionType[],
  ): () => void;
}

const browserHistory: BrowserHistory = {
  ...history,
  listenSearchParam,
};

export default browserHistory;
