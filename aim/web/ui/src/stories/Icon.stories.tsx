import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconChartHistogram } from '@tabler/icons-react';

import IconComponent from 'components/kit_v2/Icon';

import { config } from 'config/stitches';

export default {
  title: 'Kit/Data Display',
  component: IconComponent,
  argTypes: {
    color: {
      control: 'select',
      options: Object.keys((config.theme as { colors: {} }).colors).map(
        (key) => `$${key}`,
      ),
    },
  },
} as ComponentMeta<typeof IconComponent>;

const Template: ComponentStory<typeof IconComponent> = (args) => (
  <IconComponent {...args} icon={<IconChartHistogram />} />
);

export const Icon = Template.bind({});

Icon.args = {
  size: 'lg',
  color: '$primary100',
};
