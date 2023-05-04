import { ComponentStory, ComponentMeta } from '@storybook/react';

import SeparatorComponent from 'components/kit_v2/Separator';
import Box from 'components/kit_v2/Box';
import Text from 'components/kit_v2/Text';

import { config } from 'config/stitches';

export default {
  title: 'Kit/Data Display/Separator',
  component: SeparatorComponent,
  argTypes: {
    color: {
      control: 'select',
      options: Object.keys((config.theme as { colors: {} }).colors).map(
        (key) => `$${key}`,
      ),
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    margin: {
      control: 'select',
      options: Object.keys((config.theme as { space: {} }).space).map(
        (key) => `$${key}`,
      ),
    },
  },
} as ComponentMeta<typeof SeparatorComponent>;

const Template: ComponentStory<typeof SeparatorComponent> = (args) => (
  <Box display='flex' fd={args.orientation === 'horizontal' ? 'column' : 'row'}>
    <Text color='$primary100'>Aim Ui</Text>
    <SeparatorComponent {...args} />
    <Text>{args.orientation} separator</Text>
  </Box>
);

export const Horizontal = Template.bind({});

Horizontal.args = {
  orientation: 'horizontal',
  margin: '$4',
};

export const Vertical = Template.bind({});

Vertical.args = {
  orientation: 'vertical',
  margin: '$4',
};
