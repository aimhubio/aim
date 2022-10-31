function updateUrlSearchParam(param: string, value: string | null) {
  // @ts-ignore
  const params = new URL(window.location).searchParams;

  if (!value) {
    params.has(param) && params.delete(param);
  } else {
    params.set(param, value);
  }
  return `${window.location.pathname}?${params.toString()}`;
}

export default updateUrlSearchParam;
