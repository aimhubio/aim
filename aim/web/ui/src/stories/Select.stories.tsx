import { ComponentStory, ComponentMeta } from '@storybook/react';

import SelectComponent from 'components/kit_v2/TreeSelect/TreeSelect';

import { config } from 'config/stitches/stitches.config';

export default {
  title: 'Kit/Inputs',
  component: SelectComponent,
  argTypes: {
    // weight: {
    //   control: 'select',
    //   options: Object.keys(config.theme.fontWeights).map((key) => `$${key}`),
    // },
    // size: {
    //   control: 'select',
    //   options: Object.keys(config.theme.fontSizes).map((key) => `$${key}`),
    // },
    // color: {
    //   control: 'select',
    //   options: Object.keys(config.theme.colors).map((key) => `$${key}`),
    // },
  },
} as ComponentMeta<typeof SelectComponent>;

const Template: ComponentStory<typeof SelectComponent> = (args: any) => (
  <Select {...args} />
);

export const Select = Template.bind({});
