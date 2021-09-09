import _ from 'lodash-es';

function getObjectPaths(
  obj: { [key: string]: unknown },
  rootObject: { [key: string]: unknown },
  prefix: string = '',
  includeRoot: boolean = false,
): string[] {
  let rootKeys = Object.keys(obj).map((key) => {
    return { prefixedKey: prefix ? `${prefix}.${key}` : key, key };
  });
  let paths: string[] = includeRoot
    ? rootKeys.map(({ prefixedKey }) => prefixedKey)
    : Object.keys(obj)
        .filter((key) => !_.isObject(obj[key]))
        .map((key) => {
          return key;
        });
  rootKeys.forEach(({ prefixedKey }) => {
    const val: any = _.get(rootObject, prefixedKey);
    if (typeof val === 'object' && !_.isNil(val) && !Array.isArray(val)) {
      paths = paths.concat(getObjectPaths(val, rootObject, prefixedKey, true));
    }
  });

  return paths;
}

export default getObjectPaths;
