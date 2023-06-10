import _ from 'lodash-es';

type Callback = (key: string, value: any, trail: string) => void;

/**
 * function traverseTree
 * This function traverses through object keys as tree
 * @param {Record<any, any>} obj - an object should be traversed
 * @param {Callback} callback - this callback gets current key, value, and generated trail for the iteration
 *     this function has context which is the actual object passed to traverseTree method, it means you can use this inside the callback
 * @param trail - prefix to add at the start of path
 */
function traverseTree(
  obj: Record<any, any>,
  callback: Callback,
  trail: string = '',
): void {
  Object.keys(obj).forEach((key: string) => {
    let value = obj[key];
    callback.call(obj, key, value, trail);

    if (_.isObject(value)) {
      const k = trail ? `${trail}.${key}` : key;
      traverseTree(value, callback, k);
    }
  });
}

export default traverseTree;
