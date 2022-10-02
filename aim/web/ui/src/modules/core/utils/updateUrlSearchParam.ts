function updateUrlSearchParam(param: string, value: string) {
  // @ts-ignore
  const params = new URL(window.location).searchParams;
  params.set(param, value);
  return `${window.location.pathname}?${params.toString()}`;
}

export default updateUrlSearchParam;
