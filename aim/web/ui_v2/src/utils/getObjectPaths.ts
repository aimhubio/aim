function getObjectPaths(
  obj: { [key: string]: unknown },
  prefix: string = '',
  includeRoot: boolean = false,
): string[] {
  let rootKeys = Object.getOwnPropertyNames(obj).map((key) =>
    prefix ? `${prefix}.${key}` : key,
  );
  let paths: string[] = includeRoot ? rootKeys : [];
  rootKeys.forEach((key) => {
    const val: any = obj[key];
    if (typeof val === 'object' && !Array.isArray(val)) {
      paths = paths.concat(
        getObjectPaths(val, prefix ? `${prefix}.${key}` : `${key}`, true),
      );
    }
  });
  return paths;
}

export default getObjectPaths;
