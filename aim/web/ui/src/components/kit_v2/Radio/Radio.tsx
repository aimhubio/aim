import React from 'react';

import * as RadioGroup from '@radix-ui/react-radio-group';

import { styled } from 'config/stitches/stitches.config';

const RadioGroupRoot = styled(RadioGroup.Root, {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
});

const IndicatorWrapper = styled('span', {
  all: 'unset',
  display: 'inline-block',
  bc: 'white',
  width: 12,
  height: 12,
  br: '$round',
  borderRadius: '100%',
  transition: 'all 0.2s ease-out',
  boxShadow: 'inset 0 0 0 1px $colors$secondary100',
  cursor: 'pointer',
  '&:hover': { bs: 'inset 0 0 0 1px $colors$primary100' },
});

const RadioGroupItem = styled(RadioGroup.Item, {
  all: 'unset',
  backgroundColor: 'white',
  width: 20,
  height: 20,
  borderRadius: '100%',
  transition: 'all 0.2s ease-out',
  display: 'flex',
  ai: 'center',
  jc: 'center',
  cursor: 'pointer',
  '&[data-state="checked"]': {
    [`& ${IndicatorWrapper}`]: {
      bs: 'inset 0 0 0 1px $colors$primary100',
    },
  },
});

const RadioGroupIndicator = styled(RadioGroup.Indicator, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  position: 'relative',
  transition: 'all 0.2s ease-out',
  '&::after': {
    content: '""',
    display: 'block',
    width: 6,
    height: 6,
    br: '50%',
    bc: '$primary100',
  },
});

const Flex = styled('div', { display: 'flex' });

const Label = styled('label', {
  fontSize: 15,
  lineHeight: 1,
  userSelect: 'none',
  paddingLeft: 15,
});

const RadioGroupDemo = () => (
  <form>
    <RadioGroupRoot defaultValue='default' aria-label='View density'>
      <Flex css={{ alignItems: 'center' }}>
        <RadioGroupItem value='default' id='r1'>
          <IndicatorWrapper>
            <RadioGroupIndicator />
          </IndicatorWrapper>
        </RadioGroupItem>
        <Label htmlFor='r1'>Default</Label>
      </Flex>
      <Flex css={{ alignItems: 'center' }}>
        <RadioGroupItem value='comfortable' id='r2'>
          <IndicatorWrapper>
            <RadioGroupIndicator />
          </IndicatorWrapper>
        </RadioGroupItem>
        <Label htmlFor='r2'>Comfortable</Label>
      </Flex>
      <Flex css={{ alignItems: 'center' }}>
        <RadioGroupItem value='compact' id='r3'>
          <IndicatorWrapper>
            <RadioGroupIndicator />
          </IndicatorWrapper>
        </RadioGroupItem>
        <Label htmlFor='r3'>Compact</Label>
      </Flex>
    </RadioGroupRoot>
  </form>
);

export default RadioGroupDemo;
