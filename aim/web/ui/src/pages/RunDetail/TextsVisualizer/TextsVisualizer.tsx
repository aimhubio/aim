import React from 'react';

import Table from 'components/Table/Table';

import { ITextsVisualizerProps } from '../types';

import './TextsVisualizer.scss';

function TextsVisualizer(
  props: ITextsVisualizerProps | any,
): React.FunctionComponentElement<React.ReactNode> {
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
  return (
    <div className='TextsVisualizer'>
      {props.data?.processedValues && (
        <Table
          fixed={false}
          columns={tableColumns}
          data={props?.data?.processedValues}
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
