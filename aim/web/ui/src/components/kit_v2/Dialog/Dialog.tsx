import React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { IconX } from '@tabler/icons-react';

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
 * @description Dialog component is for displaying a dialog with a title, description, and actions
 * Dialog component params
 * @param {React.ReactNode} trigger - React children
 * @param {string} title - Title of the dialog
 * @param {string} description - Description of the dialog
 * @param {React.ReactNode} children - React children
 * @param {boolean} open - Open state of the dialog
 * @param {React.ReactNode} onConfirm - On confirm callback of the dialog
 * @param {React.ReactNode} onOpenChange - On open change callback of the dialog
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @constructor
 * @example
 * <Dialog
 *   title='Dialog title'
 *   description='Dialog description'
 *   onConfirm={() => console.log('confirm')}
 *   trigger={<Button>Open dialog</Button>}
 * />
 */
function Dialog({
  trigger,
  title,
  description,
  open = false,
  titleIcon,
  children,
  onConfirm,
  onOpenChange,
  ...props
}: IDialogProps): React.FunctionComponentElement<React.ReactNode> {
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
              <Button css={{ mr: '$5' }} variant='ghost' color='secondary'>
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
              variant='ghost'
              color='secondary'
              css={{ position: 'absolute', top: 8, right: 8 }}
              icon={<IconX />}
            />
          </DialogPrimitive.Close>
        </DialogContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

Dialog.displayName = 'Dialog';
export default React.memo(Dialog);
