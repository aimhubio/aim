import { encode } from 'utils/encoder/encoder';
import getUrlWithParam from 'utils/getUrlWithParam';
import { setItem } from 'utils/storage';

export default function updateUrlParam(
  paramName: string,
  data: Record<string, unknown>,
  appName: string,
): void {
  const encodedUrl: string = encode(data);
  const url: string = getUrlWithParam(paramName, encodedUrl);
  const appId: string = window.location.pathname.split('/')[2];
  if (!appId) {
    setItem(`${appName}Url`, url);
  }
  window.history.pushState(null, '', url);
}
