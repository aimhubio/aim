import React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import Button from '../Button';
import Box from '../Box';
import IconButton from '../IconButton';

import { IDialogProps } from './Dialog.d';
import {
  DialogActions,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from './Dialog.style';

/**
 * Dialog component
 * @param {IDialogProps} props
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @constructor
 * @example
 * <Dialog
 *  title='Dialog title'
 * description='Dialog description'
 * onConfirm={() => console.log('confirm')}
 * trigger={<Button>Open dialog</Button>}
 * />
 */
function Dialog({
  onConfirm,
  trigger,
  title,
  description,
  open = false,
  titleIcon,
  children,
  onOpenChange,
  ...props
}: IDialogProps) {
  return (
    <DialogPrimitive.Root
      onOpenChange={onOpenChange}
      {...(!trigger ? { open } : {})}
      {...props}
    >
      {trigger ? (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      ) : null}
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogContent>
          <Box p='$5 $4 0'>
            {title ? (
              <Box display='flex' ai='center' width='calc(100% - 20px)'>
                {titleIcon ? (
                  <Box
                    css={{
                      bc: '$blue10',
                      br: '$pill',
                      size: '$7',
                      display: 'flex',
                      ai: 'center',
                      jc: 'center',
                      mr: '$7',
                    }}
                  >
                    {titleIcon}
                  </Box>
                ) : null}
                <DialogTitle>{title}</DialogTitle>
              </Box>
            ) : null}
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
            {children}
          </Box>
          <DialogActions>
            <DialogPrimitive.Close asChild>
              <Button css={{ mr: '$5' }} variant='text' color='secondary'>
                Cancel
              </Button>
            </DialogPrimitive.Close>
            <DialogPrimitive.Close asChild>
              <Button onClick={onConfirm}>Confirm</Button>
            </DialogPrimitive.Close>
          </DialogActions>
          <DialogPrimitive.Close asChild>
            <IconButton
              size='xs'
              variant='text'
              color='secondary'
              css={{ position: 'absolute', top: 8, right: 8 }}
              icon='close'
            />
          </DialogPrimitive.Close>
        </DialogContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export default React.memo(Dialog);
