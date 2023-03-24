import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import SelectComponent from 'components/kit_v2/Select/Select';
import Button from 'components/kit_v2/Button';

export default {
  title: 'Kit/Inputs',
  component: SelectComponent,
  argTypes: {},
} as ComponentMeta<typeof SelectComponent>;

const Template: ComponentStory<typeof SelectComponent> = (args) => {
  const [multipleValues, setMultipleValues] = React.useState<string[]>([]);
  const [singleValue, setSingleValue] = React.useState('');

  const handleChange = (val: string) => {
    if (args.multiple) {
      if (multipleValues.indexOf(val) === -1) {
        setMultipleValues([...multipleValues, val]);
      } else {
        const filteredValues = multipleValues.filter((v) => v !== val);
        setMultipleValues(filteredValues);
      }
    }
    setSingleValue(val);
  };

  return (
    <SelectComponent
      {...args}
      onValueChange={handleChange}
      value={args.multiple ? multipleValues : singleValue}
      trigger={<Button>Open Select</Button>}
    />
  );
};

export const Select = Template.bind({});

Select.args = {
  multiple: true,
  searchable: true,
  options: [
    {
      group: 'Group 1',
      options: [
        { label: 'Option 1', value: 'option-1' },
        {
          label: 'Option 2',
          value: 'option-2',
        },
        {
          label: 'Option 3',
          value: 'option-3',
        },
        {
          label: 'Option 4',
          value: 'option-4',
        },
        {
          label: 'Option 5',
          value: 'option-5',
        },
        { label: 'Option 6', value: 'option-6' },
        { label: 'Option 7', value: 'option-7' },
      ],
    },
    {
      group: 'Group 2',
      options: [
        { label: 'Option 1', value: 'option2-1' },
        {
          label: 'Option 2',
          value: 'option2-2',
        },
        {
          label: 'Option 3',
          value: 'option2-3',
        },
      ],
    },
    {
      group: 'Group 3',
      options: [
        { label: 'Option 1', value: 'option3-1' },
        {
          label: 'Option 2',
          value: 'option3-2',
        },
        {
          label: 'Option 3',
          value: 'option3-3',
        },
      ],
    },
    {
      group: 'Group 4',
      options: [
        { label: 'Option 1', value: 'option4-1' },
        {
          label: 'Option 2',
          value: 'option4-2',
        },
        {
          label: 'Option 3',
          value: 'option4-3',
        },
      ],
    },
  ],
};
