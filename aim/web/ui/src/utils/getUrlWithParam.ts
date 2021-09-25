/**
 * function getUrlWithParam constructs and returns URL with encoded state values
 * @param {String | String[]} param - Object key to store in URL's search object
 * @param {String | String[]} paramValue - Object value for the corresponding key to be encoded
 */
export default function getUrlWithParam(
  param: string | string[],
  paramValue: string | string[],
): string {
  const searchParams: URLSearchParams = new URLSearchParams(
    window.location.search,
  );

  if (Array.isArray(param)) {
    param.forEach((p, i) => {
      searchParams.set(p, paramValue[i]);
    });
  } else {
    searchParams.set(param as string, paramValue as string);
  }

  return `${window.location.pathname}?${searchParams.toString()}`;
}
