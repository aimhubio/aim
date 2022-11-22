import { ComponentStory, ComponentMeta } from '@storybook/react';

import QueryBadgeComponent from 'components/kit_v2/QueryBadge';

export default {
  title: 'Kit/Inputs/QueryBadge',
  component: QueryBadgeComponent,
  argTypes: {
    color: {
      control: 'select',
    },
    size: {
      control: 'select',
    },
  },
} as ComponentMeta<typeof QueryBadgeComponent>;

const Template: ComponentStory<typeof QueryBadgeComponent> = (args) => (
  <QueryBadgeComponent {...args} />
);

export const QueryBadge = Template.bind({});

QueryBadge.args = {
  children: 'Contained Button',
};
