import React from 'react';

import Table from 'components/Table/Table';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';

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
                  <span key={part + i} className='TextsVisualizer__mark'>
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
    <div className='TextsVisualizer'>
      <SearchBar
        isValidInput={textSearch.filterOptions.isValidSearch}
        searchValue={textSearch.filterOptions.searchValue}
        matchType={textSearch.filterOptions.matchType}
        onMatchTypeChange={textSearch.changeMatchType}
        onInputClear={textSearch.clearSearchInputData}
        onInputChange={textSearch.changeSearchInput}
        isDisabled={!!props.isLoading}
      />
      <BusyLoaderWrapper
        className='VisualizationLoader'
        isLoading={!!props.isLoading}
      >
        {textSearch.data && (
          <Table
            ref={tableRef}
            fixed={false}
            className='TextsTable'
            columns={tableColumns}
            data={getHighlightedData(
              textSearch.data,
              textSearch.filterOptions.appliedRegExp,
            )}
            isLoading={props?.isLoading}
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

TextsVisualizer.displayName = 'TextsVisualizer';

export default React.memo<ITextsVisualizerProps>(TextsVisualizer);
