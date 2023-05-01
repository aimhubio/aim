import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from 'components/kit_v2/Button';
import TooltipComponent from 'components/kit_v2/Tooltip';

export default {
  title: 'Kit/Data Display',
  component: TooltipComponent,
  argTypes: {},
} as ComponentMeta<typeof TooltipComponent>;

const Template: ComponentStory<typeof TooltipComponent> = (args) => (
  <TooltipComponent {...args}>
    <Button variant='outlined'>Hover</Button>
  </TooltipComponent>
);

export const Tooltip = Template.bind({});

Tooltip.args = {
  content: 'Tooltip',
};
