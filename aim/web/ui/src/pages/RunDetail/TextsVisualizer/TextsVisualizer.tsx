import React from 'react';

import Table from 'components/Table/Table';

import { ITableRef } from 'types/components/Table/Table';

import { ITextsVisualizerProps } from '../types';

import useTextSearch from './SearchBar/useTextSearch';
import SearchBar from './SearchBar';

import './TextsVisualizer.scss';

function TextsVisualizer(
  props: ITextsVisualizerProps | any,
): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const tableColumns = [
    {
      dataKey: 'step',
      key: 'step',
      title: 'Step',
      width: 100,
    },
    {
      dataKey: 'index',
      key: 'index',
      title: 'Index',
      width: 100,
    },
    {
      dataKey: 'text',
      key: 'text',
      title: 'Text',
      width: 0,
      flexGrow: 1,
      // TODO: replace with a wrapper component for all types of texts visualization
      cellRenderer: function cellRenderer({ cellData }: any) {
        return <p>{cellData}</p>;
      },
    },
  ];
  const textSearch = useTextSearch({
    rawData: props?.data?.processedValues,
    updateData,
  });

  function updateData(data: { text: string }[]) {
    tableRef.current?.updateData({ newData: data });
  }

  return (
    <div className='TextsVisualizer'>
      <SearchBar
        isValidInput={textSearch.filterOptions.isValidSearch}
        searchValue={textSearch.filterOptions.searchValue}
        matchType={textSearch.filterOptions.matchType}
        onMatchTypeChange={textSearch.changeMatchType}
        onInputClear={textSearch.clearSearchInputData}
        onInputChange={textSearch.changeSearchInput}
      />
      {textSearch.data && (
        <Table
          ref={tableRef}
          fixed={false}
          className='TextsTable'
          columns={tableColumns}
          data={textSearch.data}
          isLoading={props?.isLoading}
          hideHeaderActions
          estimatedRowHeight={32}
          headerHeight={32}
          emptyText='No Text'
          height='100%'
        />
      )}
    </div>
  );
}

TextsVisualizer.displayName = 'TextsVisualizer';

export default React.memo<ITextsVisualizerProps>(TextsVisualizer);
