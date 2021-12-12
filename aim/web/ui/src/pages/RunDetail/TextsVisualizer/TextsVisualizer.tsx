import React from 'react';

import Table from 'components/Table/Table';

import { ITextsVisualizerProps } from '../types';

import './TextsVisualizer.scss';

function TextsVisualizer(
  props: ITextsVisualizerProps | any,
): React.FunctionComponentElement<React.ReactNode> {
  const { data, isLoading } = props;

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
      cellRenderer: function cellRenderer({ cellData }: any) {
        return <p>{cellData}</p>;
      },
    },
  ];

  return (
    <div className='TextsVisualizer'>
      <Table
        fixed={false}
        columns={tableColumns}
        data={data?.processedValues}
        isLoading={isLoading}
        hideHeaderActions
        estimatedRowHeight={32}
        headerHeight={32}
        emptyText='No Text'
        height='100%'
        onRowHover={(rowIndex) => null}
        onRowClick={(rowIndex) => null}
      />
    </div>
  );
}

TextsVisualizer.displayName = 'TextsVisualizer';

export default React.memo<ITextsVisualizerProps>(TextsVisualizer);
