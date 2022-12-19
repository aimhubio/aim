import { ComponentStory, ComponentMeta } from '@storybook/react';

import SwitchComponent from 'components/kit_v2/Switch';

export default {
  title: 'Kit/Inputs',
  component: SwitchComponent,
  argTypes: {
    size: {
      control: 'select',
    },
  },
} as ComponentMeta<typeof SwitchComponent>;

const Template: ComponentStory<typeof SwitchComponent> = (args) => (
  <SwitchComponent {...args} />
);

export const Switch = Template.bind({});

Switch.args = {};
