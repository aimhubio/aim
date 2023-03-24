import { ComponentStory, ComponentMeta } from '@storybook/react';

import SliderComponent from 'components/kit_v2/Slider';

export default {
  title: 'Kit/Inputs',
  component: SliderComponent,
  argTypes: {},
} as ComponentMeta<typeof SliderComponent>;

const Template: ComponentStory<typeof SliderComponent> = (args) => (
  <SliderComponent
    {...args}
    marks={[
      {
        value: 0,
      },
      {
        value: 25,
      },
      {
        value: 50,
        label: '50',
      },
    ]}
  />
);

export const Slider = Template.bind({});

Slider.args = {};
