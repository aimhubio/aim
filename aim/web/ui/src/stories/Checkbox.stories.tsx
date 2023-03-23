import { ComponentStory, ComponentMeta } from '@storybook/react';

import CheckBox from 'components/kit_v2/Checkbox';

export default {
  title: 'Kit/Inputs',
  component: CheckBox,
  argTypes: {
    checked: {
      control: 'select',
      options: [true, false, 'indeterminate'],
    },
  },
} as ComponentMeta<typeof CheckBox>;

const Template: ComponentStory<typeof CheckBox> = (args) => (
  <CheckBox {...args} />
);

export const Checkbox = Template.bind({});

Checkbox.args = {};
