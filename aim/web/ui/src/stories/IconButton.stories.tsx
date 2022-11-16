import { ComponentStory, ComponentMeta } from '@storybook/react';

import IconButton from 'components/kit_v2/IconButton';

export default {
  title: 'Kit/Inputs/IconButton',
  component: IconButton,
  argTypes: {
    color: {
      control: 'select',
    },
    variant: {
      control: 'select',
    },
    size: {
      control: 'select',
    },
    disabled: {
      control: 'boolean',
    },
  },
} as ComponentMeta<typeof IconButton>;

const Template: ComponentStory<typeof IconButton> = (args) => (
  <IconButton {...args} />
);

export const Contained = Template.bind({});

Contained.args = {
  icon: 'search',
  variant: 'contained',
};
export const Outlined = Template.bind({});

Outlined.args = {
  icon: 'upload',
  variant: 'outlined',
};
export const Text = Template.bind({});

Text.args = {
  icon: 'zoom-in',
  variant: 'text',
};
