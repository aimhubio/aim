import traverseTree from './traverseTree';

/**
 * function getObjectPaths
 *  input - { a: 1, b: 1, c: [], d: { e: { f: 1} }
 *  trail - '123'
 *  delimiter - '.'
 *  output- [
 *      '123.a',
 *      '123.b',
 *      '123.c',
 *      '123.d',
 *      '123.d.e',
 *      '123.d.e.f'
 *  ]
 * @param {Record<any, any>} obj - target object
 * @param {string} prefix - the prefix should be concatenated at the start of all paths, aka root node value
 * @param {string} delimiter - delimiter to connect paths
 * @returns {Array<string>} - returns an array of all paths
 */
function getObjectPaths(
  obj: Record<any, any>,
  prefix: string = '',
  delimiter: string = '.',
): Array<string> {
  let arr: Array<string> = [];
  traverseTree(
    obj,
    (...args: any[]) => {
      let key = args[2] ? `${args[2]}${delimiter}${args[0]}` : args[0];
      arr.push(key);
    },
    prefix,
  );
  return arr;
}

export default getObjectPaths;
