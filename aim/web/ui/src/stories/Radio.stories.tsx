import { ComponentStory, ComponentMeta } from '@storybook/react';

import RadioComponent from 'components/kit_v2/Radio/Radio';

export default {
  title: 'Kit/Inputs',
  component: RadioComponent,
  argTypes: {
    inputSize: {
      control: 'select',
    },
  },
} as ComponentMeta<any>;

const Template: ComponentStory<any> = (args) => <RadioComponent {...args} />;

export const Medium = Template.bind({});

Medium.args = {};
