import React from 'react';
import _ from 'lodash-es';

import {
  IconDotsVertical,
  IconEye,
  IconEyeOff,
  IconRefresh,
} from '@tabler/icons-react';

import {
  ControlsButton,
  IconButton,
  Popover,
  Tabs,
  Box,
  Text,
  ListItem,
  Icon,
  Dialog,
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
  const [hasAppliedValues, setHasAppliedValues] = React.useState(false);

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

  React.useEffect(() => {
    setHasAppliedValues(false);
    Object.entries(currentValues).forEach(
      ([key, item]: [key: string, item: any]) => {
        if (
          facetGroupings[key]?.settings?.facet &&
          item?.isApplied &&
          item?.fields?.length
        ) {
          setHasAppliedValues(true);
        }
      },
    );
  }, [currentValues, facetGroupings]);

  return (
    <Popover
      title={
        <Box display='flex' ai='center' jc='space-between'>
          <Text>Configure facet grouping</Text>
          <Popover
            popperProps={{ align: 'end', css: { width: '108px', p: '$4 0' } }}
            trigger={
              <IconButton
                variant='ghost'
                color='secondary'
                size='md'
                icon={<IconDotsVertical />}
              />
            }
            content={
              <Box display='flex' fd='column'>
                <Dialog
                  title='Reset facet groupings to default'
                  titleIcon={<IconRefresh />}
                  onConfirm={onResetGroupings}
                  description='Are you sure you want to reset the facet groupings to its default?'
                  trigger={
                    <ListItem
                      size='lg'
                      css={{ color: '$danger100', mx: '$4' }}
                      leftNode={
                        <Icon
                          color='$danger100'
                          size='md'
                          icon={<IconRefresh />}
                        />
                      }
                    >
                      Reset
                    </ListItem>
                  }
                />
              </Box>
            }
          />
        </Box>
      }
      popperProps={{ css: { padding: '0', width: '24rem' }, align: 'start' }}
      content={<Tabs tabs={tabs} />}
      trigger={({ open }) => (
        <ControlsButton open={open} hasAppliedValues={hasAppliedValues}>
          Facet
        </ControlsButton>
      )}
    />
  );
}
export default React.memo(FacetGrouping);
