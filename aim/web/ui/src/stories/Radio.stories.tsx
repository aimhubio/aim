import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Text } from 'components/kit_v2';
import RadioComponent, {
  RadioGroup as Group,
} from 'components/kit_v2/Radio/Radio';

export default {
  title: 'Kit/Inputs',
  component: RadioComponent,
  argTypes: {
    name: {
      control: {
        type: 'text',
      },
      description:
        'The name of the group. Submitted with its owning form as part of a name/value pair.',
    },
    defaultValue: {
      control: {
        type: 'select',
        options: ['1', '2'],
      },
      description:
        'The value of the radio item that should be checked when initially rendered. Use when you do not need to control the state of the radio items.',
    },
    value: {
      control: {
        type: 'select',
        options: ['1', '2'],
      },
      description:
        'The controlled value of the radio item to check. Should be used in conjunction with `onValueChange`.',
    },
    disabled: {
      control: {
        type: 'boolean',
      },
      description: 'Disables the radio group',
    },
    onValueChange: {
      control: {
        type: 'text',
      },
      description: 'Event handler called when the value changes.',
    },
    dir: {
      control: {
        type: 'select',
        options: ['ltr', 'rtl'],
      },
      description:
        'The reading direction of the radio group. If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode.',
    },
    orientation: {
      control: {
        type: 'select',
        options: ['horizontal', 'vertical'],
      },
      description: 'The orientation of the component.',
    },
  },
} as ComponentMeta<typeof Group>;

const Template: ComponentStory<typeof Group> = (args) => (
  <Group {...args}>
    <RadioComponent value='1'>
      <Text>First</Text>
    </RadioComponent>
    <RadioComponent value='2'>
      <Text>Second</Text>
    </RadioComponent>
  </Group>
);

export const RadioGroup = Template.bind({});
