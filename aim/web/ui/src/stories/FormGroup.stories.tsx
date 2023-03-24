import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconX } from '@tabler/icons-react';

import { Button, IconButton, Box, Text, Select } from 'components/kit_v2';
import FormGroupComponent from 'components/kit_v2/FormGroup/FormGroup';
import { IFormGroupProps } from 'components/kit_v2/FormGroup/FormGroup.d';

export default {
  title: 'Kit/Data Display',
  component: FormGroupComponent,
  argTypes: {},
} as ComponentMeta<typeof FormGroupComponent>;
const Template: ComponentStory<typeof FormGroupComponent> = (args) => {
  const [multipleValues, setMultipleValues] = React.useState<string[]>([]);

  const handleChange = React.useCallback(
    (val: string) => {
      if (multipleValues.indexOf(val) === -1) {
        setMultipleValues([...multipleValues, val]);
      } else {
        const filteredValues = multipleValues.filter((v) => v !== val);
        setMultipleValues(filteredValues);
      }
    },
    [multipleValues],
  );

  const data: IFormGroupProps['data'] = [
    {
      sectionFields: [
        {
          content: <Text as='span'>Row item 1</Text>,
          control: (
            <Select
              trigger={<Button>Select Values</Button>}
              multiple
              searchable
              value={multipleValues}
              onValueChange={handleChange}
              options={[
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
              ]}
            />
          ),
        },
        {
          content: (
            <Box>
              {multipleValues.map((value, id) => {
                return (
                  <Box key={id} display='flex' ai='center' gap='$2'>
                    <Text as='span'>{value}</Text>
                    <IconButton
                      onClick={() => {
                        handleChange(value);
                      }}
                      variant='ghost'
                      icon={<IconX />}
                    />
                  </Box>
                );
              })}
            </Box>
          ),
        },
        {
          content: <span>Row item 1</span>,
          control: <Button>button</Button>,
          actions: [
            {
              component: <IconButton variant='ghost' icon={<IconX />} />,
            },
          ],
        },
      ],
    },
  ];

  return <FormGroupComponent data={data} />;
};

export const FormGroup = Template.bind({});

FormGroup.args = {};
