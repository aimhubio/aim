import React from 'react';

import DataList from 'components/kit/DataList';
import { Text } from 'components/kit';

import CompareSelectedRunsPopover from 'pages/Metrics/components/Table/CompareSelectedRunsPopover';

import { AppNameEnum } from 'services/models/explorer';

import useExperimentsCard from './useExperimentsCard';

import './ExperimentsCard.scss';

function ExperimentsCard(): React.FunctionComponentElement<React.ReactNode> | null {
  const {
    tableRef,
    tableColumns,
    tableData,
    experimentsStore,
    selectedRows,
    experimentsQuery,
  } = useExperimentsCard();
  return experimentsStore.data?.length ? (
    <div className='ExperimentsCard'>
      <Text
        className='ExperimentsCard__title'
        component='h3'
        size={14}
        weight={700}
        tint={100}
      >
        Experiments ({experimentsStore.data.length})
      </Text>
      <DataList
        tableRef={tableRef}
        tableColumns={tableColumns}
        tableData={tableData}
        isLoading={experimentsStore.loading}
        height={Math.min(238, tableData.length * 24 + 56) + 'px'}
        searchableKeys={['name', 'run_count']}
        rowHeight={24}
        illustrationConfig={{
          size: 'large',
          title: 'No Results',
        }}
        toolbarItems={[
          <CompareSelectedRunsPopover
            key='compareSelectedRunsPopover'
            appName={'dashboard' as AppNameEnum}
            query={experimentsQuery}
            disabled={!selectedRows.length}
          />,
        ]}
        disableMatchBar={true}
      />
    </div>
  ) : null;
}

ExperimentsCard.displayName = 'ExperimentsCard';

export default React.memo(ExperimentsCard);
