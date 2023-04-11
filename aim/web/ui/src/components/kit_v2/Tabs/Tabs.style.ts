import * as TabPrimitive from '@radix-ui/react-tabs';

import { styled } from 'config/stitches';
const TabRoot = styled(TabPrimitive.Root, {});
const TabList = styled(TabPrimitive.List, {
  borderBottom: '1px solid $border30',
});
const TabContent = styled(TabPrimitive.Content, {
  borderTop: '2px solid $border10',
});

const TabTrigger = styled(TabPrimitive.Trigger, {
  position: 'relative',
  color: '#45484D',
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
});

export { TabRoot, TabList, TabContent, TabTrigger };
