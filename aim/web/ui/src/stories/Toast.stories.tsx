import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import {
  Toast as ToastComponent,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastRoot,
} from 'components/kit_v2/Toast';
import Button from 'components/kit_v2/Button';

export default {
  title: 'Kit/Inputs',
  component: ToastComponent,
} as ComponentMeta<typeof ToastComponent>;

const Template: ComponentStory<typeof ToastComponent> = (args) => {
  const [open, setOpen] = React.useState(false);
  const eventDateRef = React.useRef(new Date());
  const timerRef = React.useRef(0);

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
  return (
    <div>
      <Button
        onClick={() => {
          setOpen(false);
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            eventDateRef.current = oneWeekAway();
            setOpen(true);
          }, 100);
        }}
      >
        Add to calendar
      </Button>
      <ToastProvider swipeDirection='right'>
        {open && (
          <ToastComponent
            onDelete={() => {}}
            onUndo={() => {}}
            message='message'
            id='1'
            {...args}
          />
          //   <ToastRoot className='ToastRoot' open={open} onOpenChange={setOpen}>
          //     <ToastDescription asChild></ToastDescription>
          //     <ToastAction
          //       className='ToastAction'
          //       asChild
          //       altText='Goto schedule to undo'
          //     >
          //       <button className='Button small green'>Undo</button>
          //     </ToastAction>
          //   </ToastRoot>
        )}
      </ToastProvider>
    </div>
  );
};
function oneWeekAway(date?: any) {
  const now = new Date();
  const inOneWeek = now.setDate(now.getDate() + 7);
  return new Date(inOneWeek);
}

export const Toast = Template.bind({});

Toast.args = {};
