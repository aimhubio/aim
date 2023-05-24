import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconSearch } from '@tabler/icons-react';

import Button from 'components/kit_v2/Button';

export default {
  title: 'Kit/Inputs/Button',
  component: Button,
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
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Contained = Template.bind({});

Contained.args = {
  children: 'Contained Button',
};
export const Outlined = Template.bind({});

Outlined.args = {
  children: 'Outlined Button',
  variant: 'outlined',
  leftIcon: <IconSearch />,
};
export const Ghost = Template.bind({});

Ghost.args = {
  children: 'Ghost Button',
  variant: 'ghost',
};

export const Static = Template.bind({});

Static.args = {
  children: 'Static Button',
  variant: 'static',
};
