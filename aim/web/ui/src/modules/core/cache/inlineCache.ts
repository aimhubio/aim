export type InlineCache = {
  get: (key: any) => any;
  set: (key: any, value: any) => void;
  clear: () => void;
};

/**
 * Function to create an inline cache
 *
 * Usage:
 * <pre>
 *  const cache = createInlineCache();
 *  cache.set('key', 'value');
 *  const value = cache.get('key');
 *  cache.clear();
 * </pre>
 *
 * @param {optional number} cacheSize - the max size of the cache
 */
function createInlineCache(cacheSize?: number): InlineCache {
  const cache = new Map();
  return {
    get: function (key: any) {
      return cache.get(key);
    },
    set: function (key: any, value: any) {
      cache.set(key, value);
      if (cacheSize && cache.size > cacheSize) {
        cache.delete(cache.keys().next().value);
      }
    },
    clear: function () {
      cache.clear();
    },
  };
}

export default createInlineCache;
