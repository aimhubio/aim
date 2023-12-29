import React from 'react';
import { FixedSizeList as List } from 'react-window';

import { IconCaretDown, IconCaretUp } from '@tabler/icons-react';

import Popover from '../Popover';
import Button from '../Button';
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

/**
 * @description Virtualized Select component with search
 * @param {boolean} multiple - whether multiple select
 * @param {React.ReactNode} trigger - trigger element
 * @param triggerProps
 * @param {PopoverProps} popoverProps - popover props
 * @param {string | string[] | undefined } value - selected value
 * @param {(val: string | string[]) => void} onValueChange - on value change callback
 * @param {boolean} searchable - whether searchable
 * @param {ISelectItemProps['data']['items']} options - options
 * @param {('sm' | 'md' | 'lg')} size - size
 * @param {number} height - the height of the list
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
const Select = ({
  multiple,
  trigger,
  triggerProps,
  popoverProps,
  value,
  onValueChange,
  searchable,
  options = [],
  size = 'md',
  height = 256,
  disabled = false,
}: ISelectProps) => {
  const [search, setSearch] = React.useState('');
  const onSearchChange = React.useCallback((e) => {
    setSearch(e.target.value);
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

  const triggerPlaceholder = React.useMemo(() => {
    if (multiple) {
      return 'Select';
    }
    if (value) {
      const selected = flattenOptions?.find((item) => item.value === value);
      if (selected) {
        return selected.label as string;
      }
    }
    return 'Select';
  }, [flattenOptions, multiple, value]);

  return (
    <Popover
      popperProps={{
        ...popoverProps,
        css: { p: '$5 0', ...popoverProps?.css },
      }}
      trigger={({ open }) =>
        typeof trigger === 'function'
          ? trigger(open)
          : trigger || (
              <Button
                disabled={disabled}
                variant='outlined'
                color='secondary'
                rightIcon={open ? <IconCaretUp /> : <IconCaretDown />}
                {...triggerProps}
              >
                <Text css={{ flex: '1' }} disabled={disabled}>
                  {triggerPlaceholder}
                </Text>
              </Button>
            )
      }
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
