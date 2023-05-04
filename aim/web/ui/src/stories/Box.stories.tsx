import { ComponentStory, ComponentMeta } from '@storybook/react';

import BoxComponent from 'components/kit_v2/Box';

export default {
  title: 'Kit/Data Display',
  component: BoxComponent,
  argTypes: {},
} as ComponentMeta<typeof BoxComponent>;

const Template: ComponentStory<typeof BoxComponent> = (args) => (
  <BoxComponent {...args} mt='$10' />
);

export const Box = Template.bind({});

Box.args = {
  children: 'Polymorphic Box component',
  as: 'div',
  css: {
    bc: '$secondary20',
    color: '$primary80',
    p: '$4',
    br: '$2',
  },
};
