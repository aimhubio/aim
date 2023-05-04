import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconEye } from '@tabler/icons-react';

import { Icon } from 'components/kit';
import ControlButton from 'components/kit_v2/ControlsButton';
import Popover from 'components/kit_v2/Popover';

export default {
  title: 'Kit/Inputs',
  component: ControlButton,
  argTypes: {
    size: {
      control: 'select',
    },
  },
} as ComponentMeta<typeof ControlButton>;

const Template: ComponentStory<typeof ControlButton> = (args) => (
  <Popover
    content={<div>Control Popover</div>}
    trigger={({ open }) => <ControlButton {...args} open={open} />}
  />
);

export const ControlsButton = Template.bind({});

ControlsButton.args = {
  children: 'Ignore Outliers',
  leftIcon: <Icon name='ignore-outliers' />,
  rightIcon: { icon: <IconEye />, onClick: () => {} },
};
