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

  const isExistBasePath = (window as any).API_BASE_PATH !== '{{ base_path }}';

  const appId: string =
    window.location.pathname.split('/')[isExistBasePath ? 3 : 2];
  if (!appId) {
    let fullURL = url;

    if (isExistBasePath) {
      fullURL = fullURL.replace((window as any).API_BASE_PATH, '');
    }

    setItem(`${appName}Url`, fullURL);
  }

  window.history.pushState(null, '', url);
}
