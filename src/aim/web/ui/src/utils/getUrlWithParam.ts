/**
 * function getUrlWithParam constructs and returns URL with encoded state values
 * @params {[key: string]: string} params - Object properties to store in URL's search object
 * ex. params = { grouping: 'some string' }
 */
export default function getUrlWithParam(params: {
  [key: string]: string;
}): string {
  const paramsKeys: string[] = Object.keys(params);

  const searchParams: URLSearchParams = new URLSearchParams(
    window.location.search,
  );

  paramsKeys?.forEach((key: string) => {
    searchParams.set(key, params[key]);
  });

  return `${window.location.pathname}?${searchParams.toString()}`;
}
