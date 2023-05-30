function getUpdatedUrl(
  param: string,
  value: string | null,
  pathname: string = window.location.pathname,
) {
  // @ts-ignore
  const params = new URL(window.location).searchParams;

  if (!value) {
    params.has(param) && params.delete(param);
  } else {
    params.set(param, value);
  }
  return `${pathname}?${params.toString()}`;
}

export default getUpdatedUrl;
