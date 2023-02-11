import React from 'react';
import { areEqual, FixedSizeList as List } from 'react-window';

import { IconCheck } from '@tabler/icons';

import Popover from '../Popover';
import Button from '../Button';
import ListItem from '../ListItem';
import Icon from '../Icon';
import { CheckBox } from '../Checkbox/Checkbox';
import Box from '../Box';
import Text from '../Text';
import Input from '../Input';

import { ISelectProps, ISelectItemProps } from './Select.d';
import SelectItem from './SelectItem';

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

  const onSearchChange = React.useCallback((val: string) => {
    setSearch(val);
  }, []);

  const flattenOptions: ISelectItemProps['data']['items'] | [] =
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

  const searchedOptions: ISelectItemProps['data']['items'] | [] =
    React.useMemo(() => {
      let data: ISelectItemProps['data']['items'] | any[] = [];
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
                return false;
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
                    <>
                      {beforeStr}
                      <Text css={{ bc: '$mark' }}>{middleStr}</Text>
                      {afterStr}
                    </>
                  ) : (
                    opt.label
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

  const data: ISelectItemProps['data'] = React.useMemo(() => {
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
                onChange={onSearchChange}
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
          <Box>
            <List
              height={Math.min(height, data.items.length * sizeDict[size])}
              itemCount={data.items.length}
              itemSize={sizeDict[size]}
              itemData={data}
              width={'100%'}
            >
              {SelectItem}
            </List>
          </Box>
        </>
      }
    />
  );
};

Select.displayName = 'Select';
export default React.memo(Select);
