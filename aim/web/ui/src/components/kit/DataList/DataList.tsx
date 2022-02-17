import React from 'react';

import Table from 'components/Table/Table';
import useTextSearch from 'components/kit/DataList/SearchBar/useTextSearch';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';

import SearchBar from './SearchBar';
import { IDataListProps } from './DataList.d';

import './DataList.scss';

function DataList({
  tableRef,
  data,
  isLoading,
  tableColumns,
  withoutSearchBar,
}: IDataListProps): React.FunctionComponentElement<React.ReactNode> {
  const textSearch = useTextSearch({
    rawData: data,
    updateData,
  });

  function getHighlightedData(data: { text: string }[], regex: RegExp | null) {
    return data.map((d) => ({
      ...d,
      text:
        regex === null
          ? d.text
          : d.text
              .split(regex)
              .filter((part: string) => part !== '')
              .map((part: string, i: number) =>
                regex.test(part) ? (
                  <span key={part + i} className='DataList__mark'>
                    {part}
                  </span>
                ) : (
                  part
                ),
              ),
    }));
  }

  function updateData(data: { text: string }[], regex: RegExp | null) {
    tableRef.current?.updateData({ newData: getHighlightedData(data, regex) });
  }
  return (
    <div className={'DataList'}>
      {!withoutSearchBar && (
        <SearchBar
          isValidInput={textSearch.filterOptions.isValidSearch}
          searchValue={textSearch.filterOptions.searchValue}
          matchType={textSearch.filterOptions.matchType}
          onMatchTypeChange={textSearch.changeMatchType}
          onInputClear={textSearch.clearSearchInputData}
          onInputChange={textSearch.changeSearchInput}
          isDisabled={!!isLoading}
        />
      )}
      <BusyLoaderWrapper
        className='VisualizationLoader'
        isLoading={!!isLoading}
      >
        {textSearch.data && (
          <Table
            ref={tableRef}
            fixed={false}
            className='DataList__textsTable'
            columns={tableColumns}
            data={getHighlightedData(
              textSearch.data,
              textSearch.filterOptions.appliedRegExp,
            )}
            isLoading={isLoading}
            hideHeaderActions
            estimatedRowHeight={32}
            headerHeight={32}
            emptyText='No Result'
            height='100%'
          />
        )}
      </BusyLoaderWrapper>
    </div>
  );
}

DataList.displayName = 'DataList';

export default React.memo<IDataListProps>(DataList);
