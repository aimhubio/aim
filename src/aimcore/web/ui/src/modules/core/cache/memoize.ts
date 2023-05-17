import { isFunction } from 'lodash-es';

/**
 * memoize is a simple memoizer for functions
 * @param fn
 */
function memoize<T, P>(fn: (args: T) => P | unknown): (args: T) => P {
  if (!isFunction(fn)) {
    throw Error('memCache fn:function parameter should be a function');
  }
  let cache = new Map<string, any>();

  return (args: T) => {
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

export default memoize;
