import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from 'components/kit_v2/Button';
import Popover from 'components/kit_v2/Popover';
import TreeComponent from 'components/kit_v2/Tree';

export default {
  title: 'Kit/Inputs',
  component: TreeComponent,
  argTypes: {},
} as ComponentMeta<typeof TreeComponent>;

const treeData: any = [
  {
    title: <span>0-0</span>,
    key: '0-0',
    children: [
      {
        title: '0-0-0',
        key: '0-0-0',
        children: [
          { title: '0-0-0-0', key: '0-0-0-0' },
          { title: '0-0-0-1', key: '0-0-0-1' },
          { title: '0-0-0-2', key: '0-0-0-2' },
        ],
      },
      {
        title: '0-0-1',
        key: '0-0-1',
        children: [
          { title: '0-0-1-0', key: '0-0-1-0' },
          { title: '0-0-1-1', key: '0-0-1-1' },
          { title: '0-0-1-2', key: '0-0-1-2' },
        ],
      },
      {
        title: '0-0-2',
        key: '0-0-2',
      },
    ],
  },
  {
    title: '0-1',
    key: '0-1',
    children: [
      { title: '0-1-0-0', key: '0-1-0-0' },
      { title: '0-1-0-1', key: '0-1-0-1' },
      { title: '0-1-0-2', key: '0-1-0-2' },
    ],
  },
  {
    title: '0-2',
    key: '0-2',
  },
];

const Template: ComponentStory<typeof TreeComponent> = (args: any) => (
  <Popover
    trigger={<Button>Open the Tree</Button>}
    content={<TreeComponent {...args} data={treeData} checkable />}
  />
);

export const Tree = Template.bind({});
