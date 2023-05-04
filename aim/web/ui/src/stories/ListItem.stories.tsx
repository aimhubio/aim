import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Icon } from 'components/kit';
import ListItemComponent from 'components/kit_v2/ListItem';

export default {
  title: 'Kit/Data Display/ListItem',
  component: ListItemComponent,
  argTypes: {
    size: {
      control: 'select',
    },
  },
} as ComponentMeta<typeof ListItemComponent>;

const IconNode = (
  <Icon
    name='eye-fill-show'
    style={{
      width: 20,
      height: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  />
);
const Template1: ComponentStory<typeof ListItemComponent> = (args) => (
  <ListItemComponent {...args}>List Item</ListItemComponent>
);

export const Default = Template1.bind({});

Default.args = {
  size: 'md',
};

const Template2: ComponentStory<typeof ListItemComponent> = (args) => (
  <ListItemComponent {...args} leftNode={IconNode}>
    List Item
  </ListItemComponent>
);

export const WithLeftNode = Template2.bind({
  size: 'lg',
});

const Template3: ComponentStory<typeof ListItemComponent> = (args) => (
  <ListItemComponent {...args} rightNode={IconNode}>
    List Item
  </ListItemComponent>
);

export const WithRightNode = Template3.bind({
  size: 'xl',
});
