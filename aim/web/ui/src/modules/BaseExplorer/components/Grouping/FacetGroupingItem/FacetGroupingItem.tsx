import React from 'react';

import {
  IconCaretDown,
  IconCaretUp,
  IconGripVertical,
  IconX,
} from '@tabler/icons-react';
import { Divider } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';
import {
  Box,
  Text,
  Select,
  ToggleButton,
  Button,
  Tooltip,
  Icon,
  Input,
} from 'components/kit_v2';
import { SelectOptionType } from 'components/kit_v2/Select';
import VirtualizedDraggableList from 'components/VirtualizedDraggableList';
import { ClearButtonContainer } from 'components/kit_v2/Input/Input.style';

import { GroupType, Order } from 'modules/core/pipeline';

import shortenRunPropLabel from 'utils/shortenRunPropLabel';

import { IGroupingItemProps } from '../GroupingItem';
import { IGroupingSelectOption } from '../GroupingPopover';

function FacetGroupingItem({
  groupName,
  iconName = 'chart-group',
  inputLabel,
  advancedComponent,
  title,
  ...props
}: IGroupingItemProps): React.FunctionComponentElement<React.ReactNode> {
  const {
    engine: { useStore, pipeline, groupings },
  } = props;
  const availableModifiers = useStore(pipeline.additionalDataSelector);
  const currentValues = useStore(groupings.currentValuesSelector);
  const groupingState = useStore(groupings.stateSelector);

  const changeGroupingValuesAndApply = React.useCallback(
    (values: any) => {
      groupings.update(values);
      pipeline.group(values);
    },
    [groupings, pipeline],
  );

  const allFlattenOptions: IGroupingSelectOption[] = React.useMemo(() => {
    const modifiers = availableModifiers?.modifiers ?? [];
    return modifiers.map((modifier: string) => {
      return {
        label: modifier,
        value: modifier,
        group: modifier.slice(0, modifier.indexOf('.')),
      };
    });
  }, [availableModifiers?.modifiers]);

  const allOptions: SelectOptionType[] = React.useMemo(() => {
    const modifiers = availableModifiers?.modifiers ?? [];
    const optionsDict: Record<string, Required<SelectOptionType>> = {};
    modifiers.forEach((modifier: string) => {
      const group = modifier.slice(0, modifier.indexOf('.'));
      if (optionsDict[group]) {
        optionsDict[group].options.push({ label: modifier, value: modifier });
      } else {
        optionsDict[group] = {
          group,
          options: [{ label: modifier, value: modifier }],
        };
      }
    });
    return Object.values(optionsDict);
  }, [availableModifiers?.modifiers]);

  const appliedOptions: { option: IGroupingSelectOption; order: Order }[] =
    React.useMemo(() => {
      const data: { option: IGroupingSelectOption; order: Order }[] = [];
      const group = currentValues[groupName];
      allFlattenOptions.forEach((option: IGroupingSelectOption) => {
        const index = group.fields.indexOf(option.value);
        if (index > -1) {
          data.push({ option, order: group.orders[index] });
        }
      });

      // Sort selected values by the order of their application
      return currentValues
        ? data.sort(
            (a, b) =>
              group.fields.indexOf(a.option.value) -
              group.fields.indexOf(b.option.value),
          )
        : data;
    }, [allFlattenOptions, currentValues, groupName]);

  const onChangeSelectedFieldSortingOrder = React.useCallback(
    (option: IGroupingSelectOption, order: Order) => {
      const group = currentValues[groupName];
      if (group.isApplied) {
        const groupingValues = { ...currentValues };
        const index = group.fields.indexOf(option.value);
        const orders = [...group.orders];
        if (index !== -1) {
          orders[index] = order;
          groupingValues[groupName] = { ...group, orders };
        }
        changeGroupingValuesAndApply(groupingValues);
      }
    },
    [changeGroupingValuesAndApply, currentValues, groupName],
  );

  const onChangeSelectedFieldOrder = React.useCallback(
    (ids: string[]) => {
      const group = currentValues[groupName];
      if (group.isApplied) {
        const groupingValues = { ...currentValues };
        const fields = ids.map((id) => id);
        const orders = fields.map(
          (field) => group.orders[group.fields.indexOf(field)],
        );
        groupingValues[groupName] = { ...group, fields, orders };
        changeGroupingValuesAndApply(groupingValues);
      }
    },
    [changeGroupingValuesAndApply, currentValues, groupName],
  );

  const onSelectField = React.useCallback(
    (value: string) => {
      const group = currentValues[groupName];
      if (group.isApplied) {
        const groupingValues = { ...currentValues };

        let fields = [...group.fields];
        if (fields.indexOf(value) === -1) {
          fields = [...fields, value];
        } else {
          fields = fields.filter((v) => v !== value);
        }
        const orders = [...group.orders, Order.ASC];
        groupingValues[groupName] = { ...group, fields, orders };
        changeGroupingValuesAndApply(groupingValues);
      }
    },
    [changeGroupingValuesAndApply, currentValues, groupName],
  );

  const onEmptySelectedFields = React.useCallback(
    (e) => {
      e.stopPropagation();
      const group = currentValues[groupName];
      if (group.isApplied) {
        const groupingValues = { ...currentValues };
        groupingValues[groupName] = { ...group, fields: [], orders: [] };
        changeGroupingValuesAndApply(groupingValues);
      }
    },
    [changeGroupingValuesAndApply, currentValues, groupName],
  );

  const onRemoveSelectedField = React.useCallback(
    (value: string) => {
      const group = currentValues[groupName];
      if (group.isApplied) {
        const groupingValues = { ...currentValues };
        const fields = [...group.fields].filter((v) => v !== value);
        const orders = fields.map(
          (field) => group.orders[group.fields.indexOf(field)],
        );
        groupingValues[groupName] = { ...group, fields, orders };
        changeGroupingValuesAndApply(groupingValues);
      }
    },
    [changeGroupingValuesAndApply, currentValues, groupName],
  );

  const onChangeGridMaxColumnCount = React.useCallback(
    ({ target }) => {
      const { value } = target;
      if (value) {
        groupings[GroupType.GRID].methods.update({ maxColumnCount: value });
      }
    },
    [groupings],
  );

  const group = currentValues[groupName];
  return (
    <ErrorBoundary>
      <Box display='flex' p='$7' fd='column' data-disabled={!group.isApplied}>
        {groupName === GroupType.GRID && (
          <>
            <Box display='flex' jc='space-between' ai='center'>
              <Text>Max count of column</Text>
              <Input
                css={{ width: 90 }}
                placeholder='Number'
                type='number'
                value={groupingState[groupName].maxColumnCount}
                min={1}
                onChange={onChangeGridMaxColumnCount}
              />
            </Box>
            <Box mt='$5' mb='$5'>
              <Divider />
            </Box>
          </>
        )}
        <Box display='flex' jc='space-between' ai='center' flex={1}>
          <Text>Arrange items into {groupName} by</Text>
          <Select
            multiple
            searchable
            popoverProps={{
              side: 'right',
              align: 'start',
              css: { maxWidth: 300 },
            }}
            options={allOptions}
            value={appliedOptions.map(({ option }) => option.value)}
            trigger={(open) => (
              <Button
                size='md'
                variant='outlined'
                css={{ '&:hover': {} }}
                color='secondary'
                rightIcon={open ? <IconCaretUp /> : <IconCaretDown />}
              >
                <Text>{`${group.fields.length || ''} selected field(s)`}</Text>
                {group.fields.length > 0 && (
                  <ClearButtonContainer
                    size='md'
                    css={{ ml: '$5', position: 'unset' }}
                    onClick={onEmptySelectedFields}
                  >
                    <Icon className='Icon__container' icon={<IconX />} />
                  </ClearButtonContainer>
                )}
              </Button>
            )}
            onValueChange={onSelectField}
          />
        </Box>
        <Box mt='$5'>
          <VirtualizedDraggableList
            onDragEnd={onChangeSelectedFieldOrder}
            items={appliedOptions.map(({ option, order }) => ({
              id: option.value,
              content: (
                <Box
                  key={option.value + '-' + order}
                  display='flex'
                  jc='space-between'
                >
                  <Box display='flex' jc='space-between' ai='center'>
                    <Icon
                      size='md'
                      icon={<IconGripVertical />}
                      color='#ACB2BC'
                      css={{ mr: '$5' }}
                    />

                    <Tooltip content={option.label}>
                      <Text>
                        {shortenRunPropLabel(option.label, 200).shortenValue}
                      </Text>
                    </Tooltip>
                  </Box>
                  <Box display='flex' jc='space-between' ai='center'>
                    <ToggleButton
                      leftLabel='Asc'
                      rightLabel='Desc'
                      leftValue={Order.ASC}
                      rightValue={Order.DESC}
                      value={order}
                      onChange={(value) =>
                        onChangeSelectedFieldSortingOrder(
                          option,
                          value as Order,
                        )
                      }
                    />
                    <ClearButtonContainer
                      size='md'
                      css={{ ml: '$5', position: 'unset' }}
                      onClick={() => onRemoveSelectedField(option.value)}
                    >
                      <Icon className='Icon__container' icon={<IconX />} />
                    </ClearButtonContainer>
                  </Box>
                </Box>
              ),
            }))}
          />
        </Box>
      </Box>
    </ErrorBoundary>
  );
}

FacetGroupingItem.displayName = 'FacetGroupingItem';

export default React.memo<IGroupingItemProps>(FacetGroupingItem);
