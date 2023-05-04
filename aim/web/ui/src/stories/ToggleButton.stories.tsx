import { ComponentStory, ComponentMeta } from '@storybook/react';

import ToggleComponent from 'components/kit_v2/ToggleButton';

export default {
  title: 'Kit/Inputs',
  component: ToggleComponent,
  argTypes: {},
} as ComponentMeta<typeof ToggleComponent>;

const Template: ComponentStory<typeof ToggleComponent> = (args) => (
  <ToggleComponent {...args} />
);

export const ToggleButton = Template.bind({});

ToggleButton.args = {
  leftLabel: 'Left',
  rightLabel: 'Right',
  rightValue: 'right',
  leftValue: 'left',
  value: 'left',
};
