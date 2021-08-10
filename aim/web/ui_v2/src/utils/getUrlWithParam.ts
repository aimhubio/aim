export default function getUriWithParam(
  param: string,
  paramValue: string,
): string {
  const searchParams: URLSearchParams = new URLSearchParams(
    window.location.search,
  );
  searchParams.set(param, paramValue);
  return `${window.location.pathname}?${searchParams.toString()}`;
}
