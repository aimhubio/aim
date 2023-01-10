import React from 'react';

import * as SelectPrimitive from '@radix-ui/react-select';
import { styled } from '@stitches/react';
import { IconCheck } from '@tabler/icons';

import Popover from '../Popover';
import Button from '../Button';
import ListItem from '../ListItem';
import Icon from '../Icon';

import { ISelectProps } from './Select.d';

export const Select = React.forwardRef(
  ({ multiple, options, trigger, ...props }: ISelectProps, forwardedRef) => {
    return (
      <Popover
        trigger={<Button>Open</Button>}
        content={
          <StyledSelect>
            <SelectPrimitive.Root
              onValueChange={(e: any) => {
                console.log(e);
              }}
              open
            >
              <SelectContent>
                {options?.map((item) => {
                  return (
                    <SelectPrimitive.Group key={item.group}>
                      {item.group && <SelectLabel>{item.group}</SelectLabel>}
                      {item.options.map((option) => (
                        <SelectItem key={option.label} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectPrimitive.Group>
                  );
                })}
                <SelectPrimitive.Group>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value='apple'>Apple</SelectItem>
                  <SelectItem value='banana'>Banana</SelectItem>
                  <SelectItem value='blueberry'>Blueberry</SelectItem>
                  <SelectItem value='grapes'>Grapes</SelectItem>
                  <SelectItem value='pineapple'>Pineapple</SelectItem>
                </SelectPrimitive.Group>
              </SelectContent>
            </SelectPrimitive.Root>
          </StyledSelect>
        }
      />
    );
  },
);

const StyledSelect = styled('div', {
  '& > div': {
    position: 'unset !important',
  },
});

const SelectIcon = styled(SelectPrimitive.SelectIcon, {});

const SelectContent = styled(SelectPrimitive.Content, {
  //   boxShadow:
  //     '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
});

const SelectViewport = styled(SelectPrimitive.Viewport, {
  padding: 5,
});

const SelectItem = React.forwardRef(
  ({ children, ...props }: any, forwardedRef) => {
    return (
      <StyledItem {...props} ref={forwardedRef}>
        <ListItem css={{ width: '100%' }}>
          <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
          <StyledItemIndicator>
            <Icon css={{ color: '$primary100' }} icon={<IconCheck />} />
          </StyledItemIndicator>
        </ListItem>
      </StyledItem>
    );
  },
);

const StyledItem = styled(SelectPrimitive.Item, {
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
  '&[data-highlighted]': {
    outline: 'none',
  },
});

const SelectLabel = styled(SelectPrimitive.Label, {
  padding: '0 25px',
  fontSize: 12,
  lineHeight: '25px',
  color: 'mauve',
});

const SelectSeparator = styled(SelectPrimitive.Separator, {
  height: 1,
  margin: 5,
});

const StyledItemIndicator = styled(SelectPrimitive.ItemIndicator, {
  position: 'absolute',
  right: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const scrollButtonStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 25,
  backgroundColor: 'white',
  cursor: 'default',
};

const SelectScrollUpButton = styled(
  SelectPrimitive.ScrollUpButton,
  scrollButtonStyles,
);

const SelectScrollDownButton = styled(
  SelectPrimitive.ScrollDownButton,
  scrollButtonStyles,
);

export default Select;
