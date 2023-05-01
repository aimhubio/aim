import * as TabPrimitive from '@radix-ui/react-tabs';

import { styled } from 'config/stitches';

const TabList = styled(TabPrimitive.List, {
  borderBottom: '1px solid $border30',
  bs: '0 2px 0 $colors$border10',
});

const TabRoot = styled(TabPrimitive.Root, {
  '&[data-orientation="horizontal"]': {
    width: '100%',
    [`${TabList}`]: {
      padding: '0 $13',
    },
  },
});

const TabContent = styled(TabPrimitive.Content, {});

const TabTrigger = styled(TabPrimitive.Trigger, {
  position: 'relative',
  color: '$textPrimary80',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '$7',
  '&[data-state="active"]': {
    color: '$primary100',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
      background: '$primary100',
      borderRadius: '6px 6px 0 0',
    },
  },
  '&[data-disabled]': {
    color: '$textPrimary50',
  },
});

export { TabRoot, TabList, TabContent, TabTrigger };
