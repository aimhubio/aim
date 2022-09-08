import React from 'react';

import DataList from 'components/kit/DataList';
import { Text } from 'components/kit';

import CompareSelectedRunsPopover from 'pages/Metrics/components/Table/CompareSelectedRunsPopover';

import { AppNameEnum } from 'services/models/explorer';

import useTagsCard from './useTagsCard';

import './TagsCard.scss';

function TagsCard() {
  const {
    tableRef,
    tableColumns,
    tableData,
    tagsStore,
    selectedRows,
    tagsQuery,
  } = useTagsCard();
  return (
    <div className='TagsCard'>
      <Text className='TagsCard__title' component='h3' size={18}>
        Tags
      </Text>
      <DataList
        tableRef={tableRef}
        tableColumns={tableColumns}
        tableData={tableData}
        isLoading={tagsStore.loading}
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
            query={tagsQuery}
            disabled={!selectedRows.length}
          />,
        ]}
      />
    </div>
  );
}

TagsCard.displayName = 'TagsCard';

export default React.memo(TagsCard);
