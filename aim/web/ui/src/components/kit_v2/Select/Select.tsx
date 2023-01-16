import React from 'react';
import { areEqual, FixedSizeList as List } from 'react-window';

import * as SelectPrimitive from '@radix-ui/react-select';
import { styled } from '@stitches/react';
import { IconCheck } from '@tabler/icons';

import Popover from '../Popover';
import Button from '../Button';
import ListItem from '../ListItem';
import Icon from '../Icon';
import { CheckBox } from '../Checkbox/Checkbox';
import Box from '../Box';
import Text from '../Text';
import Input from '../Input';

import { ISelectProps, ISelectRowProps } from './Select.d';

const StyledItem: any = styled(ListItem, {
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  userSelect: 'none',
  width: '100%',
  '&[data-state=checked]': {
    color: '$primary100',
  },
  '&[data-disabled]': {
    color: 'mauve',
    pointerEvents: 'none',
  },
  '&[data-highlighted=true]': {
    outline: 'none',
  },
});

const StyledSelect = styled('div', {
  '& > div': {
    position: 'unset !important',
  },
});

const sizeDict = {
  sm: 20,
  md: 24,
  lg: 28,
};
const Select = ({
  multiple,
  trigger,
  popoverProps,
  value,
  onValueChange,
  searchable,
  options = [],
  size = 'md',
  height = 256,
}: ISelectProps) => {
  const [search, setSearch] = React.useState('');

  const flattenOptions: ISelectRowProps['data']['items'] | [] =
    React.useMemo(() => {
      if (options.length > 0) {
        return options
          ?.map((item) => {
            if (item.group) {
              return [{ group: item.group }, ...item.options!];
            } else {
              return [...item.options!];
            }
          })
          .flat();
      } else {
        return [];
      }
    }, [options]);

  const searchedOptions: ISelectRowProps['data']['items'] | [] =
    React.useMemo(() => {
      let data: ISelectRowProps['data']['items'] | any[] = [];
      if (searchable && options.length > 0) {
        data = options
          ?.map((item) => {
            const filteredData = item?.options
              ?.filter((option) => {
                if (option.label) {
                  return (option.label as string)
                    .toLowerCase()
                    .includes(search.toLowerCase());
                }
              })
              .map((opt: any) => {
                const searchVal = search.toLowerCase();
                const index = opt.label.toLowerCase().indexOf(searchVal);
                const beforeStr = opt.label.substring(0, index);
                const afterStr = opt.label.slice(index + search.length);
                const middleStr = opt.label.substring(
                  index,
                  index + search.length,
                );
                const title =
                  index > -1 ? (
                    <Text>
                      {beforeStr}
                      <Text css={{ bc: '$mark' }}>{middleStr}</Text>
                      {afterStr}
                    </Text>
                  ) : (
                    <Text>{opt.label}</Text>
                  );
                return { ...opt, label: title };
              });

            if (filteredData?.length) {
              return { ...item, options: filteredData };
            }
            return null;
          })
          .filter(Boolean);
      }

      if (data?.length > 0) {
        const flatten = data
          ?.map((item) => {
            if (item.group) {
              return [{ group: item.group }, ...item.options];
            } else {
              return [...item.options];
            }
          })
          .flat();
        return flatten;
      }
      return [];
    }, [options, search, searchable]);

  const noResults: boolean = React.useMemo(() => {
    if (searchable) {
      return (
        !!search && searchedOptions.length === 0 && flattenOptions?.length > 0
      );
    }
    return false;
  }, [search, searchable, searchedOptions, flattenOptions]);

  const data: ISelectRowProps['data'] = React.useMemo(() => {
    const items = searchable ? searchedOptions : flattenOptions;
    return {
      items: noResults ? flattenOptions : items,
      value,
      onValueChange,
      multiple,
      size,
    };
  }, [
    flattenOptions,
    multiple,
    noResults,
    onValueChange,
    searchable,
    searchedOptions,
    size,
    value,
  ]);

  return (
    <Popover
      {...popoverProps}
      popperProps={{ css: { p: '$5 0' } }}
      trigger={({ open }) => trigger || <Button size={size}>Select</Button>}
      content={
        <>
          {searchable ? (
            <Box css={{ m: '0 $5 $5' }}>
              <Input
                onChange={(v: any) => setSearch(v)}
                value={search}
                placeholder='Search'
              />
              {noResults ? (
                <Box
                  display='flex'
                  ai='center'
                  jc='center'
                  p='$5'
                  css={{ borderBottom: '1px solid $secondary10' }}
                >
                  <Text color='$textPrimary50'>No Results</Text>
                </Box>
              ) : null}
            </Box>
          ) : null}
          <StyledSelect>
            <SelectPrimitive.Root open={true}>
              <List
                height={Math.min(height, data.items.length * sizeDict[size])}
                itemCount={data.items.length}
                itemSize={sizeDict[size]}
                itemData={data}
                width={'100%'}
              >
                {Row}
              </List>
            </SelectPrimitive.Root>
          </StyledSelect>
        </>
      }
    />
  );
};

const Row = React.memo(({ data, index, style }: any) => {
  const { items, value, onValueChange, multiple, size } = data;
  const item = items[index];
  const selected = value === item.value || value?.indexOf(item.value) !== -1;
  const rightNode = multiple ? null : selected ? (
    <Icon css={{ color: '$primary100' }} icon={<IconCheck />} />
  ) : null;

  return (
    <>
      {item.group ? (
        <Text
          css={{ p: '0 $5', display: 'flex', ai: 'center' }}
          style={style}
          key={index}
        >
          {item.group}
        </Text>
      ) : (
        <StyledItem
          key={index}
          style={style}
          leftNode={multiple ? <CheckBox checked={selected} /> : null}
          size={size}
          css={{ p: '0 $8' }}
          onClick={() => onValueChange(item.value)}
          rightNode={rightNode}
        >
          <Text css={{ color: selected ? '$primary100' : '$textPrimary' }}>
            {item.label}
          </Text>
        </StyledItem>
      )}
    </>
  );
}, areEqual);

export default React.memo(Select);
