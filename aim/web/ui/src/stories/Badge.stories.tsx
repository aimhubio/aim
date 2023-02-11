import { ComponentStory, ComponentMeta } from '@storybook/react';

import BadgeComponent from 'components/kit_v2/Badge';

export default {
  title: 'Kit/Data Display',
  component: BadgeComponent,
  argTypes: {
    color: {
      control: 'select',
    },
    size: {
      control: 'select',
    },
    onDelete: {
      control: 'string',
    },
  },
} as ComponentMeta<typeof BadgeComponent>;

const Template: ComponentStory<typeof BadgeComponent> = (args) => (
  <BadgeComponent {...args} />
);

export const Badge = Template.bind({});

Badge.args = {
  label: 'Badge',
  onDelete: () => {},
};
