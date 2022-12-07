import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconDeviceComputerCamera } from '@tabler/icons';

import IconComponent from 'components/kit_v2/Icon';

export default {
  title: 'Kit/Inputs',
  component: IconComponent,
} as ComponentMeta<typeof IconComponent>;

const Template: ComponentStory<typeof IconComponent> = (args) => (
  <IconComponent {...args} icon={<IconDeviceComputerCamera />} />
);

export const Icon = Template.bind({});

Icon.args = {
  size: 'lg',
  css: {
    color: '$primary80',
  },
};

<Icon
  icon={<IconDeviceComputerCamera />}
  size='lg'
  css={{ bc: '$primary10' }}
/>;
