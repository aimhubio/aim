import React from 'react';

import { FilterOptions, MatchTypes, UseTextSearchProps } from './types.d';

const defaultFilterOption: FilterOptions = {
  matchType: null,
  searchValue: '',
  isValidSearch: true,
};

function useTextSearch({ rawData, updateData }: UseTextSearchProps) {
  const [data, setData] = React.useState<{ text: string }[]>(rawData);
  const [filterOptions, setFilterOptions] =
    React.useState<FilterOptions>(defaultFilterOption);

  React.useEffect(() => {
    setData(rawData);
  }, [rawData, filterOptions, setData]);

  function filter(search: string, matchType: MatchTypes | null) {
    if (!search) {
      setData(rawData);
      updateData(rawData);
      return;
    }
    const filteredData = data?.filter((item: { text: string }) => {
      switch (matchType) {
        case MatchTypes.Word:
          break;
        case MatchTypes.Case:
          if (item.text.indexOf(search) > -1) {
            return item;
          }
          break;
        case MatchTypes.RegExp:
          try {
            let match = search.match(new RegExp('^/(.*?)/([gimy]*)$'));
            let regex;
            if (match) {
              regex = new RegExp(match[1], match[2]);
            } else {
              regex = new RegExp(search, 'g');
            }
            if (regex.test(item.text)) {
              return item;
            }
          } catch (e) {
            setFilterOptions({
              ...filterOptions,
              isValidSearch: false,
            });
          }

          break;
        default:
          if (item.text.toLowerCase().indexOf(search.toLowerCase()) > -1) {
            return item;
          }
      }
    });

    setData(filteredData);
    updateData(filteredData);
  }

  function clearSearchInputData() {
    changeSearchInput('');
  }

  function changeSearchInput(value: string) {
    filter(value, filterOptions.matchType);
    setFilterOptions({
      ...filterOptions,
      searchValue: value,
    });
  }

  function changeMatchType(matchType: MatchTypes | null) {
    filter(filterOptions.searchValue, matchType);
    setFilterOptions({
      ...filterOptions,
      matchType,
    });
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
