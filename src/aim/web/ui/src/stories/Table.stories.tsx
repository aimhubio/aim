import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Button } from 'components/kit_v2';
import TableComponent from 'components/kit_v2/Table';

export default {
  title: 'Kit/Data Display',
  component: TableComponent,
  argTypes: {},
} as ComponentMeta<typeof TableComponent>;

const Template: ComponentStory<typeof TableComponent> = (args) => (
  <TableComponent {...args} />
);

export const Table = Template.bind({});
const numberList = ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6'];
Table.args = {
  data: {
    Metrics: [
      <Button size='xs' key={1}>
        Custom Button
      </Button>,
      '0.2',
      '0.3',
      '0.4',
      '0.5',
      '0.6',
    ],
    'Train Loss': numberList,
    'Train Accuracy': numberList,
    'Validation Loss': numberList,
    'Validation Accuracy': numberList,
  },
  selectedIndices: [0, 1],
};
