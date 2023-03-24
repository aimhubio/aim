import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import DataList from 'components/kit/DataList';

import { ITableRef } from 'types/components/Table/Table';

import { ITextsVisualizerProps } from '../types';

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
      // eslint-disable-next-line react/display-name
      cellRenderer: ({ cellData }: any) => (
        <div className='ScrollBar__hidden TextsVisualizer__textCell'>
          <pre>{cellData}</pre>
        </div>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <div className='TextsVisualizer'>
        <DataList
          tableRef={tableRef}
          tableData={props?.data?.processedValues}
          tableColumns={tableColumns}
          isLoading={props?.isLoading}
          searchableKeys={['text']}
        />
      </div>
    </ErrorBoundary>
  );
}

TextsVisualizer.displayName = 'TextsVisualizer';

export default React.memo<ITextsVisualizerProps>(TextsVisualizer);
