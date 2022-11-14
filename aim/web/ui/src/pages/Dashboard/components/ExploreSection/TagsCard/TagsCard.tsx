import React from 'react';
import { NavLink } from 'react-router-dom';

import DataList from 'components/kit/DataList';
import { Button, Text } from 'components/kit';

import CompareSelectedRunsPopover from 'pages/Metrics/components/Table/CompareSelectedRunsPopover';

import { AppNameEnum } from 'services/models/explorer';

import useTagsCard from './useTagsCard';

import './TagsCard.scss';

function TagsCard(): React.FunctionComponentElement<React.ReactNode> | null {
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
      <Text
        className='TagsCard__title'
        component='h3'
        size={14}
        weight={700}
        tint={100}
      >
        Tags {tagsStore?.data?.length ? `(${tagsStore?.data?.length})` : ''}
      </Text>
      {tagsStore?.data?.length ? (
        <DataList
          tableRef={tableRef}
          tableColumns={tableColumns}
          tableData={tableData}
          isLoading={tagsStore.loading}
          height={Math.min(238, tableData.length * 24 + 56) + 'px'}
          searchableKeys={['name', 'run_count']}
          rowHeight={24}
          disableMatchBar={true}
          illustrationConfig={{
            size: 'small',
            title: 'No Results',
            showImage: false,
          }}
          toolbarItems={[
            <CompareSelectedRunsPopover
              key='compareSelectedRunsPopover'
              appName={'dashboard' as AppNameEnum}
              query={tagsQuery}
              disabled={!selectedRows.length}
            />,
          ]}
        />
      ) : null}
      <NavLink className='TagsCard__NavLink' to='/tags'>
        <Button fullWidth size='xSmall' variant='outlined'>
          {tagsStore?.data?.length ? 'See all tags' : 'Create a new tag'}
        </Button>
      </NavLink>
    </div>
  );
}

TagsCard.displayName = 'TagsCard';

export default React.memo(TagsCard);
