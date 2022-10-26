import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from 'components/kit_v2/ControlsButton';
import Popover from 'components/kit_v2/Popover';

export default {
  title: 'Kit/Inputs',
  component: Button,
  argTypes: {
    size: {
      control: 'select',
    },
    rightIcon: {},
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => (
  <Popover
    content={<div>Control Popover</div>}
    trigger={({ open }) => <Button {...args} open={open} />}
  />
);

export const ControlsButton = Template.bind({});

ControlsButton.args = {
  children: 'Ignore Outliers',
  leftIcon: 'ignore-outliers',
  rightIcon: { name: 'eye-fill-show', onClick: () => {} },
};
