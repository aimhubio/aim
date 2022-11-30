import getStateFromUrl from 'utils/getStateFromUrl';

function getUrlSearchParam(paramName: string) {
  return getStateFromUrl(paramName);
}

export default getUrlSearchParam;
