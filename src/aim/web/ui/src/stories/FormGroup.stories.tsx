import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import {
  Button,
  Text,
  Select,
  ControlsButton,
  Popover,
  ToggleButton,
} from 'components/kit_v2';
import FormGroupComponent, {
  IFormGroupProps,
} from 'components/kit_v2/FormGroup';

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
              searchable
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
