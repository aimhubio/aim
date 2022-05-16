import isFunction from 'lodash';

/**
 * memCache is a simple memoizer for functions
 * @param fn
 */
function memCache(fn: Function): Function {
  if (!isFunction(fn)) {
    throw Error('memCache fn:function parameter should be function');
  }

  let cache = new Map<string, any>();

  return (args: any) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    } else {
      const originalMethodResult = fn(args);
      cache.set(key, originalMethodResult);
      return originalMethodResult;
    }
  };
}

export default memCache;
