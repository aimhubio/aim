import { ComponentStory, ComponentMeta } from '@storybook/react';

import RadioComponent, { RadioGroup } from 'components/kit_v2/Radio/Radio';

export default {
  title: 'Kit/Inputs',
  component: RadioComponent,
  argTypes: {
    value: {
      control: {
        type: 'select',
        options: ['1', '2'],
      },
    },
  },
} as ComponentMeta<typeof RadioGroup>;

const Template: ComponentStory<typeof RadioGroup> = (args) => (
  <RadioGroup defaultValue='1'>
    <div>
      <RadioComponent value='1' /> <span>First</span>
    </div>
    <div>
      <RadioComponent value='2' /> <span>Second</span>
    </div>
  </RadioGroup>
);

export const Radio = Template.bind({});
