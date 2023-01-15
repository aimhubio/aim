import React from 'react';
import { FixedSizeList as List } from 'react-window';

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

import { ISelectProps } from './Select.d';

const sizeDict = {
  sm: 20,
  md: 24,
  lg: 28,
};
export const Select = React.forwardRef(
  ({
    multiple,
    options,
    trigger,
    popoverProps,
    value,
    size = 'md',
    onValueChange,
    searchable,
    height = 256,
    ...props
  }: ISelectProps) => {
    const [search, setSearch] = React.useState('');

    const flattenOptions: any = React.useMemo(() => {
      const flatten = options
        ?.map((item: any) => {
          if (item.group) {
            return [{ group: item.group }, ...item.options];
          } else {
            return [...item.options];
          }
        })
        .flat();
      return flatten;
    }, [options]);

    const searchedOptions: any = React.useMemo(() => {
      let data: any = [];
      if (searchable) {
        data = options
          ?.map((item) => {
            const options = item.options.filter((option) =>
              option.label.toLowerCase().includes(search.toLowerCase()),
            );
            if (options.length) {
              return { ...item, options };
            }
            return null;
          })
          .filter(Boolean);
      }

      if (data.length > 0) {
        const flatten = data
          ?.map((item: any) => {
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

    const noResults = React.useMemo(() => {
      if (searchable) {
        return (
          search && searchedOptions.length === 0 && flattenOptions?.length > 0
        );
      }
      return false;
    }, [search, searchable, searchedOptions, flattenOptions]);

    const data = noResults ? flattenOptions : searchedOptions;
    return (
      <>
        <Popover
          {...popoverProps}
          popperProps={{ css: { p: '$5 0' } }}
          trigger={({ open }) => <Button size={size}>Select</Button>}
          content={
            <div>
              {searchable ? (
                <Box css={{ m: '0 $5 $5' }}>
                  <Input
                    onChange={(v: any) => setSearch(v)}
                    value={search}
                    placeholder='Search'
                  />
                  {noResults ? (
                    <Box
                      flex
                      ai='center'
                      jc='center'
                      p='$4'
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
                    height={Math.min(
                      height,
                      flattenOptions.length * sizeDict[size],
                    )}
                    itemCount={data.length}
                    itemSize={sizeDict[size]}
                    width={'100%'}
                  >
                    {({ index, style }) => {
                      const item: {
                        group?: string;
                        value: string;
                        label: string;
                      } = data[index];
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
                            <SelectItem
                              key={index}
                              style={style}
                              multiple={multiple}
                              value={item.value}
                              selected={
                                value === item.value ||
                                value?.indexOf(item.value) !== -1
                              }
                              size={size}
                              onChange={onValueChange}
                            >
                              {item.label}
                            </SelectItem>
                          )}
                        </>
                      );
                    }}
                  </List>
                </SelectPrimitive.Root>
              </StyledSelect>
            </div>
          }
        />
      </>
    );
  },
);

const StyledSelect = styled('div', {
  '& > div': {
    position: 'unset !important',
  },
});

const SelectItem = React.forwardRef(
  (
    { children, multiple, size, selected, onChange, ...props }: any,
    forwardedRef,
  ) => {
    return (
      <StyledItem
        {...props}
        ref={forwardedRef}
        leftNode={multiple ? <CheckBox checked={selected} /> : null}
        css={{ width: '100%' }}
        size={size}
        role='option'
        onClick={() => onChange(props.value)}
      >
        <Text>{children}</Text>
        {multiple ? null : (
          <StyledItemIndicator>
            <Icon css={{ color: '$primary100' }} icon={<IconCheck />} />
          </StyledItemIndicator>
        )}
      </StyledItem>
    );
  },
);

const StyledItem = styled(ListItem, {
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  userSelect: 'none',
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

const StyledItemIndicator = styled(SelectPrimitive.ItemIndicator, {
  position: 'absolute',
  right: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export default Select;
