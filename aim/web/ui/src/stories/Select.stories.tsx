import { ComponentStory, ComponentMeta } from '@storybook/react';

import ControlButton from 'components/kit_v2/Select/Select';
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
    trigger={({ open }) => <ControlButton />}
  />
);

export const Select = Template.bind({});

Select.args = {
  children: 'Ignore Outliers',
  leftIcon: 'ignore-outliers',
  rightIcon: { name: 'eye-fill-show', onClick: () => {} },
};
