import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconAlien } from '@tabler/icons-react';

import Button from 'components/kit_v2/Button';
import DialogComponent from 'components/kit_v2/Dialog';
import Text from 'components/kit_v2/Text';
import Icon from 'components/kit_v2/Icon';

export default {
  title: 'Kit/Feedback/Dialog',
  component: DialogComponent,
  argTypes: {},
} as ComponentMeta<typeof DialogComponent>;

const Template: ComponentStory<typeof DialogComponent> = (args) => (
  <DialogComponent {...args} />
);

const Template2: ComponentStory<typeof DialogComponent> = (args) => {
  const [open, setOpen] = React.useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Controlled Dialog</Button>
      <DialogComponent
        title='Controlled Dialog'
        onOpenChange={handleOpenChange}
        open={open}
        {...args}
      >
        <Text>Dialog Content</Text>
      </DialogComponent>
    </div>
  );
};

export const UncontrolledDialog = Template.bind({});
export const ControlledDialog = Template2.bind({});

UncontrolledDialog.args = {
  description: 'Dialog description',
  title: 'Dialog title',
  trigger: <Button>Uncontrolled Dialog</Button>,
  titleIcon: <Icon icon={<IconAlien />} />,
};

ControlledDialog.args = {
  description: 'Dialog description',
  title: 'Dialog title',
};
