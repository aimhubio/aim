import getUrlWithParam from 'utils/getUrlWithParam';
import { setItem } from 'utils/storage';

/**
 * function updateURL has 2 major functionalities:
 *    1. Keeps URL in sync with the incoming argument "data"
 *    2. Stores updated URL in localStorage if App is not in the bookmark state
 * @data ex. {IAppConfig} configData - the current state of the app config
 */

export default function updateUrlParam({
  data,
  appName,
}: {
  data: { [key: string]: string };
  appName: string;
}): void {
  const url: string = getUrlWithParam(data);

  if (url === `${window.location.pathname}${window.location.search}`) {
    return;
  }

  const appId: string = window.location.pathname.split('/')[2];
  if (!appId) {
    setItem(`${appName}Url`, url);
  }

  window.history.pushState(null, '', url);
}
