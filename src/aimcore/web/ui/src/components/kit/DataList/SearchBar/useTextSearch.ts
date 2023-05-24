import React from 'react';

import { FilterOptions, MatchTypes, UseTextSearchProps } from './types.d';

const defaultFilterOption: FilterOptions = {
  matchType: null,
  searchValue: '',
  isValidSearch: true,
  appliedRegExp: null,
};

function useTextSearch({
  rawData,
  updateData,
  searchableKeys,
}: UseTextSearchProps) {
  const [data, setData] = React.useState<{ text: string }[]>(rawData);
  const [filterOptions, setFilterOptions] =
    React.useState<FilterOptions>(defaultFilterOption);

  React.useEffect(() => {
    if (filterOptions.appliedRegExp) {
      const filteredData = filterByCase(
        filterOptions.searchValue,
        filterOptions.appliedRegExp,
        filterOptions.matchType,
      );

      setData(filteredData);
      updateData(filteredData, filterOptions.appliedRegExp);
    } else {
      setData(rawData);
      updateData(rawData, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawData]);

  function search(search: string, matchType: MatchTypes | null) {
    if (!search) {
      setData(rawData);
      updateData(rawData, null);
      setFilterOptions((fO) => ({
        ...fO,
        appliedRegExp: null,
      }));
      return;
    }
    let appliedRegExp: RegExp | null;
    // @TODO fix \ and [ symbols issue
    try {
      switch (matchType) {
        case MatchTypes.Word:
          search = `\\b${search}\\b`;
          appliedRegExp = new RegExp(`(${search})`, 'gi');
          break;
        case MatchTypes.Case:
          appliedRegExp = new RegExp(`(${search})`, 'g');
          break;
        case MatchTypes.RegExp:
          try {
            let match = search.match(new RegExp('^/(.*?)/([gimy]*)$'));
            if (match) {
              appliedRegExp = new RegExp(`(${match[1]})`, match[2]);
            } else {
              appliedRegExp = new RegExp(`(${search})`, 'g');
            }
          } catch (e) {
            appliedRegExp = null;
          }
          break;
        default:
          appliedRegExp = new RegExp(`(${search})`.toLowerCase(), 'gi');
      }
    } catch {
      appliedRegExp = new RegExp('()'.toLowerCase(), 'gi');
    }

    const filteredData = filterByCase(search, appliedRegExp, matchType);

    setFilterOptions((fO) => ({
      ...fO,
      appliedRegExp,
    }));
    setData(filteredData);
    updateData(filteredData, appliedRegExp);
  }

  function filterByCase(
    search: string,
    appliedRegExp: RegExp | null,
    matchType: MatchTypes | null,
  ) {
    const searchableKeysList = searchableKeys ?? Object.keys(rawData[0] || {});
    const index = searchableKeysList.indexOf('key');
    if (index > -1) {
      searchableKeysList.splice(index, 1);
    }
    return rawData?.filter((item: any) => {
      return !!searchableKeysList.find((searchableKey: string) => {
        const text = `${item[searchableKey]}`;
        switch (matchType) {
          case MatchTypes.Word:
            if (text.search(appliedRegExp!) > -1) {
              return item;
            }
            break;
          case MatchTypes.Case:
            if (text.indexOf(search) > -1) {
              return item;
            }
            break;
          case MatchTypes.RegExp:
            try {
              if (appliedRegExp!.test(text)) {
                return item;
              }
            } catch (e) {
              setFilterOptions((fO) => ({
                ...fO,
                isValidSearch: false,
                appliedRegExp: null,
              }));
            }

            break;
          default:
            if (text.toLowerCase().indexOf(search.toLowerCase()) > -1) {
              return item;
            }
        }
        return false;
      });
    });
  }

  function clearSearchInputData() {
    changeSearchInput('');
  }

  function changeSearchInput(value: string) {
    search(value, filterOptions.matchType);
    setFilterOptions((fO) => ({
      ...fO,
      searchValue: value,
    }));
  }

  function changeMatchType(matchType: MatchTypes | null) {
    search(filterOptions.searchValue, matchType);
    setFilterOptions((fO) => ({
      ...fO,
      matchType,
    }));
  }

  return {
    data,
    filterOptions,
    changeMatchType,
    clearSearchInputData,
    changeSearchInput,
  };
}

export default useTextSearch;
