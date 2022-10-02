import type { Listener, Update } from 'history';
import { Action } from 'history';

import history from 'history/browser';

import { decode } from 'utils/encoder/encoder';

function createListener<T>(
  param: string,
  listener: (data: T | null) => void,
): Listener {
  let latest: string | null = new URLSearchParams(history.location.search).get(
    param,
  );

  return (update: Update) => {
    const searchParams = new URLSearchParams(update.location.search);

    const current = searchParams.get(param);
    console.log({ latest, current, d: update, update: latest !== current });

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

function listenToSearchParam<T>(
  param: string,
  listener: (data: T | null) => void,
) {
  return history.listen(createListener<T>(param, listener));
}

export default listenToSearchParam;
