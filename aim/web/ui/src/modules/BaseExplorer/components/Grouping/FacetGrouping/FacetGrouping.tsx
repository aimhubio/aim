import React from 'react';
import _ from 'lodash-es';

import { IconEye, IconEyeOff } from '@tabler/icons-react';

import {
  ControlsButton,
  IconButton,
  Popover,
  Tabs,
  Box,
  Text,
  Tooltip,
  Button,
} from 'components/kit_v2';
import { ITabsProps } from 'components/kit_v2/Tabs';

import { GroupType } from 'modules/core/pipeline';

import { IFacetGroupingProps } from '.';

function FacetGrouping(props: IFacetGroupingProps) {
  const {
    facetGroupings,
    renderGrouping,
    engine: { useStore, groupings, pipeline },
  } = props;
  const currentValues = useStore(groupings.currentValuesSelector);

  const onToggleApplyingGrouping = React.useCallback(
    (groupName: string) => {
      const isApplied = !currentValues[groupName].isApplied;
      let groupingValues = {
        ...currentValues,
        [groupName]: {
          ...currentValues[groupName],
          isApplied,
        },
      };
      if (isApplied) {
        switch (groupName) {
          case GroupType.GRID: {
            groupingValues = {
              ...groupingValues,
              [GroupType.ROW]: {
                ...groupingValues[GroupType.ROW],
                isApplied: false,
              },
              [GroupType.COLUMN]: {
                ...groupingValues[GroupType.COLUMN],
                isApplied: false,
              },
            };
            break;
          }
          case GroupType.ROW:
          case GroupType.COLUMN: {
            groupingValues = {
              ...groupingValues,
              [GroupType.GRID]: {
                ...groupingValues[GroupType.GRID],
                isApplied: false,
              },
            };
            break;
          }
        }
      }
      groupings.update(groupingValues);
      pipeline.group(groupingValues);
    },
    [currentValues, groupings, pipeline],
  );

  const tabs: ITabsProps['tabs'] = Object.entries(facetGroupings).map(
    ([key, item]) => ({
      label: _.capitalize(key),
      labelRightIcon: (
        <IconButton
          size='sm'
          variant='ghost'
          color={currentValues[key].isApplied ? 'primary' : 'secondary'}
          icon={currentValues[key].isApplied ? <IconEye /> : <IconEyeOff />}
          onClick={(e) => {
            e.stopPropagation();
            onToggleApplyingGrouping(key);
          }}
        />
      ),
      value: key,
      content: renderGrouping([key, item]),
    }),
  );

  const onResetGroupings = React.useCallback(() => {
    groupings.reset();
    groupings.resetFacetState();
    pipeline.reset();
  }, [groupings, pipeline]);

  return (
    <Popover
      title={
        <Box display='flex' ai='center' jc='space-between'>
          <Text>Configure facet grouping</Text>
          <Tooltip content='Reset facet groupings state'>
            <Button size='sm' variant='outlined' onClick={onResetGroupings}>
              Reset
            </Button>
          </Tooltip>
        </Box>
      }
      popperProps={{ css: { padding: '0', width: '24rem' }, align: 'start' }}
      content={<Tabs tabs={tabs} />}
      trigger={({ open }) => (
        <Box mr='$5'>
          <ControlsButton open={open}>Facet</ControlsButton>
        </Box>
      )}
    />
  );
}
export default React.memo(FacetGrouping);
