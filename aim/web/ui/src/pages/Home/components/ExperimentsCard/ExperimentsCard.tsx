import React from 'react';

import DataList from 'components/kit/DataList';
import { Text } from 'components/kit';

import CompareSelectedRunsPopover from 'pages/Metrics/components/Table/CompareSelectedRunsPopover';

import { AppNameEnum } from 'services/models/explorer';

import useExperimentsCard from './useExperimentsCard';

import './ExperimentsCard.scss';

function ExperimentsCard() {
  const { tableRef, tableColumns, tableData, experimentsStore, selectedRows } =
    useExperimentsCard();
  return (
    <div className='ExperimentsCard'>
      <Text className='ExperimentsCard__title' component='h3' size={18}>
        Experiments
      </Text>
      <DataList
        tableRef={tableRef}
        tableColumns={tableColumns}
        tableData={tableData}
        isLoading={experimentsStore.loading}
        height='350px'
        searchableKeys={['name', 'run_count']}
        illustrationConfig={{
          size: 'large',
          title: 'No Results',
        }}
        toolbarItems={[
          <CompareSelectedRunsPopover
            key='compareSelectedRunsPopover'
            appName={'home' as AppNameEnum}
            selectedRows={selectedRows}
            keyName='experiment'
            disabled={!selectedRows.length}
          />,
        ]}
      />
    </div>
  );
}

ExperimentsCard.displayName = 'ExperimentsCard';

export default React.memo(ExperimentsCard);
