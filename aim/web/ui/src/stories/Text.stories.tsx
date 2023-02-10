import { ComponentStory, ComponentMeta } from '@storybook/react';

import TextComponent from 'components/kit_v2/Text';

import { config } from 'config/stitches';

export default {
  title: 'Kit/Typography',
  component: TextComponent,
  argTypes: {
    weight: {
      control: 'select',
      options: Object.keys(config.theme.fontWeights).map((key) => `$${key}`),
    },
    size: {
      control: 'select',
      options: Object.keys(config.theme.fontSizes).map((key) => `$${key}`),
    },
    color: {
      control: 'select',
      options: Object.keys(config.theme.colors).map((key) => `$${key}`),
    },
  },
} as ComponentMeta<typeof TextComponent>;

const Template: ComponentStory<typeof TextComponent> = (args) => (
  <TextComponent {...args} />
);

export const Text = Template.bind({});

Text.args = {
  children: 'Polymorphic Text component',
  weight: '$2',
  size: '$3',
  color: '$textPrimary',
};
