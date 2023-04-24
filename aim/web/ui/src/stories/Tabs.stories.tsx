import { ComponentStory, ComponentMeta } from '@storybook/react';

import TabsComponent from 'components/kit_v2/Tabs';

export default {
  title: 'Kit/Data Display',
  component: TabsComponent,
  argTypes: {},
} as ComponentMeta<typeof TabsComponent>;

const Template: ComponentStory<typeof TabsComponent> = (args) => (
  <TabsComponent {...args} />
);

export const Tabs = Template.bind({});

Tabs.args = {
  tabs: [
    {
      label: 'Tab 1',
      value: 'tab1',
      content: 'Tab1Content',
    },
    {
      label: 'Tab 2',
      value: 'tab2',
      content: 'Tab2Content',
    },
    {
      label: 'Tab 3',
      value: 'tab3',
      content: 'Tab3Content',
      disabled: true,
    },
  ],
};
