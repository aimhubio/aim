import { ComponentStory, ComponentMeta } from '@storybook/react';

import Input from 'components/kit_v2/Input';

export default {
  title: 'Kit/Inputs/Input',
  component: Input,
  argTypes: {
    inputSize: {
      control: 'select',
    },
  },
} as ComponentMeta<typeof Input>;

const Template: ComponentStory<typeof Input> = (args) => <Input {...args} />;

export const Medium = Template.bind({});

Medium.args = {
  inputSize: 'medium',
  value: 'Default Input',
};
export const Large = Template.bind({});

Large.args = {
  inputSize: 'large',
  value: 'Large Input',
};
export const XLarge = Template.bind({});

XLarge.args = {
  inputSize: 'xLarge',
  value: 'xLarge Input',
};
