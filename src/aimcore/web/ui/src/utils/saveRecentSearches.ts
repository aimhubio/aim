import { getItem, setItem } from './storage';

/**
 * Save last 3 successful searches to local storage
 * @param appName - name of the explorer
 * @param query - search query
 * @example saveRecentSearches("metrics", "(run.active == False) and ((metric.name == "best_loss") or (metric.name == "bleu"))")
 * @returns void
 */
function saveRecentSearches(appName: string, query: string): void {
  if (query) {
    // get recent searches from local storage
    const recentSearches = JSON.parse(getItem('recentSearches') || '[]');

    // find if search already exists
    const searchIndex: number = recentSearches.findIndex(
      (search: { explorer: string; query: string }) =>
        search.explorer === appName && search.query === query,
    );

    // skip adding search if it already exists
    if (searchIndex !== -1) {
      recentSearches.splice(searchIndex, 1);
    } else if (recentSearches.length === 3) {
      // remove last element if array length is 3
      recentSearches.pop();
    }
    // push new search to the start of array
    recentSearches.unshift({ explorer: appName, query });
    // save recent searches to local storage
    setItem('recentSearches', JSON.stringify(recentSearches));
  }
}

export default saveRecentSearches;
