import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconDeviceComputerCamera } from '@tabler/icons';

import IconComponent from 'components/kit_v2/Icon';

import { config } from 'config/stitches/stitches.config';

export default {
  title: 'Kit/Inputs',
  component: IconComponent,
  argTypes: {
    color: {
      control: 'select',
      options: Object.keys(config.theme.colors).map((key) => `$${key}`),
    },
  },
} as ComponentMeta<typeof IconComponent>;

const Template: ComponentStory<typeof IconComponent> = (args) => (
  <IconComponent {...args} icon={<IconDeviceComputerCamera />} />
);

export const Icon = Template.bind({});

Icon.args = {
  size: 'lg',
};
