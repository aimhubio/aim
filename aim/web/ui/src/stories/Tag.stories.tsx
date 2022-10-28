import { ComponentStory, ComponentMeta } from '@storybook/react';

import Tag from 'components/kit_v2/Tag';

export default {
  title: 'Kit/Inputs',
  component: Tag,
  argTypes: {
    color: {
      control: 'select',
    },
    variant: {
      control: 'select',
    },
    size: {
      control: 'select',
    },
  },
} as ComponentMeta<typeof Tag>;

const Template: ComponentStory<typeof Tag> = (args) => <Tag {...args} />;

export const Contained = Template.bind({});

Contained.args = {
  color: ' #E6CCFF',
  label: 'Contained Button',
};
