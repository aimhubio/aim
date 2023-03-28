import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconRotate2 } from '@tabler/icons-react';

import {
  Button,
  IconButton,
  Box,
  Text,
  Select,
  ControlsButton,
  Popover,
  ToggleButton,
  Input,
} from 'components/kit_v2';
import FormGroupComponent from 'components/kit_v2/FormGroup/FormGroup';
import { IFormGroupProps } from 'components/kit_v2/FormGroup/FormGroup.d';

export default {
  title: 'Kit/Data Display',
  component: FormGroupComponent,
  argTypes: {},
} as ComponentMeta<typeof FormGroupComponent>;
const Template: ComponentStory<typeof FormGroupComponent> = (args) => {
  const [alignment, setAlignment] = React.useState<string>('');

  const handleChangeSelect = React.useCallback((val: string) => {
    setAlignment(val);
  }, []);

  const data: IFormGroupProps['data'] = [
    {
      sectionFields: [
        {
          content: <Text>X-axis alignment</Text>,
          control: (
            <Select
              trigger={<Button>Select</Button>}
              // searchable
              popoverProps={{
                onOpenAutoFocus: (e: any) => {
                  e.stopPropagation();
                  e.preventDefault();
                },
              }}
              onValueChange={handleChangeSelect}
              value={alignment}
              options={[
                {
                  options: [
                    { label: 'Step', value: 'step' },
                    {
                      label: 'Epoch',
                      value: 'epoch',
                    },
                    {
                      label: 'Relative time',
                      value: 'relative-time',
                    },
                    {
                      label: 'Absolute time',
                      value: 'absolute-time',
                    },
                  ],
                },
                {
                  group: 'Metric',
                  options: [
                    { label: 'Loss', value: 'loss' },
                    { label: 'Accuracy', value: 'accuracy' },
                    { label: 'bleu', value: 'bleu' },
                  ],
                },
              ]}
            />
          ),
        },
      ],
    },
    {
      sectionFields: [
        {
          content: <Text>Y-axis range</Text>,
          control: (
            <Box display='flex'>
              <Input
                min='0'
                type='number'
                css={{ width: '90px', mr: '$5' }}
                placeholder='Min'
              />
              <Input type='number' css={{ width: '90px' }} placeholder='Max' />
            </Box>
          ),
          actions: [
            {
              component: (
                <IconButton
                  color='secondary'
                  size='lg'
                  icon={<IconRotate2 />}
                  variant='static'
                />
              ),
            },
          ],
        },
        {
          content: <Text>X-axis range</Text>,
          control: (
            <Box display='flex'>
              <Input css={{ width: '90px', mr: '$5' }} placeholder='Min' />
              <Input css={{ width: '90px' }} placeholder='Max' />
            </Box>
          ),
          actions: [
            {
              component: (
                <IconButton
                  color='secondary'
                  size='lg'
                  icon={<IconRotate2 />}
                  variant='static'
                />
              ),
            },
          ],
        },
      ],
    },
    {
      sectionFields: [
        {
          content: <Text>X-axis scale</Text>,
          control: (
            <ToggleButton
              value='linear'
              onChange={() => {}}
              leftLabel='Linear'
              leftValue='linear'
              rightLabel='Log'
              rightValue='log'
            />
          ),
        },
        {
          content: <Text>Y-axis scale</Text>,
          control: (
            <ToggleButton
              value='linear'
              onChange={() => {}}
              leftLabel='Linear'
              leftValue='linear'
              rightLabel='Log'
              rightValue='log'
            />
          ),
        },
      ],
    },
  ];
  return (
    <Popover
      popperProps={{
        css: {
          padding: '0',
        },
      }}
      title='Axes properties'
      trigger={({ open }) => (
        <ControlsButton open={open}>Axes properties</ControlsButton>
      )}
      content={<FormGroupComponent data={data} />}
    />
  );
};

export const FormGroup = Template.bind({});

FormGroup.args = {};
