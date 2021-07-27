function getObjectPaths(
  obj: { [key: string]: unknown },
  prefix: string = '',
  level: number = 1,
): string[] {
  let zeroLevelKeys = Object.getOwnPropertyNames(obj).map((key) =>
    prefix ? `${prefix}.${key}` : key,
  );
  let paths: string[] = level === 0 ? zeroLevelKeys : [];
  zeroLevelKeys.forEach((key) => {
    const val: any = obj[key];
    if (typeof val === 'object' && !Array.isArray(val)) {
      paths = paths.concat(
        getObjectPaths(val, prefix ? `${prefix}.${key}` : `${key}`, 0),
      );
    }
  });
  return paths;
}

export default getObjectPaths;
