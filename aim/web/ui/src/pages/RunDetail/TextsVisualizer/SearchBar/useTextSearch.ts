import React, { useEffect } from 'react';

import { FilterOptions, MatchTypes, UseTextSearchProps } from './types.d';

const defaultFilterOption: FilterOptions = {
  matchType: null,
  searchValue: '',
  isValidSearch: true,
  appliedRegExp: null,
};

function useTextSearch({ rawData, updateData }: UseTextSearchProps) {
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
    return rawData?.filter((item: { text: string }) => {
      switch (matchType) {
        case MatchTypes.Word:
          if (item.text.search(appliedRegExp!) > -1) {
            return item;
          }
          break;
        case MatchTypes.Case:
          if (item.text.indexOf(search) > -1) {
            return item;
          }
          break;
        case MatchTypes.RegExp:
          try {
            if (appliedRegExp!.test(item.text)) {
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
          if (item.text.toLowerCase().indexOf(search.toLowerCase()) > -1) {
            return item;
          }
      }
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
