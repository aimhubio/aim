import * as TabPrimitive from '@radix-ui/react-tabs';

import { styled } from 'config/stitches';

const TabList = styled(TabPrimitive.List, {
  '&[data-orientation="horizontal"]': {
    display: 'flex',
  },
  borderBottom: '1px solid $border-default-bgborder-light',
});

const TabRoot = styled(TabPrimitive.Root, {
  '&[data-orientation="horizontal"]': {
    width: '100%',
    [`${TabList}`]: {
      padding: '0 $7',
    },
  },
});

const TabContent = styled(TabPrimitive.Content, {
  maxHeight: 'calc(100% - 40px)',
  height: '100%',
});

const TabTriggerWrapper = styled('div', {
  position: 'relative',
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const TabTrigger = styled(TabPrimitive.Trigger, {
  color: '#45484D',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '$7',
  '&[data-state="active"]': {
    color: '$text-focus-primary-plain',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
      background: '$background-focus-primary-plain',
      borderRadius: '6px 6px 0 0',
    },
  },
  '&[data-disabled]': {
    color: '$text-disable-text-subtle',
  },
});

export { TabRoot, TabList, TabContent, TabTrigger, TabTriggerWrapper };
