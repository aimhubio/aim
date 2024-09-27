import React from 'react';

import { IconX } from '@tabler/icons-react';

import { ColorPaletteType } from 'config/stitches/types';

import Button, { IButtonProps } from '../Button';
import IconButton from '../IconButton';
import Box from '../Box';
import Icon from '../Icon';

import { IToastProps } from './Toast.d';
import { ToastAction, ToastDescription, ToastRoot } from './Toast.style';

/**
 * Toast component
 * @param {IToastProps} props
 * @param {object} css - css object
 * @param {string} message - message to display
 * @param {React.ReactNode} icon - icon to display
 * @param {Function} onUndo - callback function to call when undo button is clicked
 * @param {Function} onDelete - callback function to call when delete button is clicked
 * @param {string} id - id of the toast
 * @param {string} status - status of the toast
 * @param {object} rest - rest of the props
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @see https://www.radix-ui.com/docs/primitives/components/toast
 * @see https://stitches.dev/docs/overriding-styles#the-css-prop
 * @constructor
 * @example
 * import { Toast } from 'components/kit_v2/Toast';
 * <Toast
 *  message='This is a toast message'
 * icon={<Icon icon='info' />}
 * onUndo={() => console.log('undo')}
 * onDelete={() => console.log('delete')}
 * id='1'
 * status='info'
 * />
 */

const ToastItem = React.forwardRef<typeof ToastRoot, IToastProps>(
  (
    {
      css,
      message,
      icon,
      onUndo,
      onDelete,
      id,
      status = 'danger',
      ...rest
    }: IToastProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const hasAction = React.useMemo(
      () => !!onUndo || !!onDelete,
      [onUndo, onDelete],
    );

    return (
      <ToastRoot
        {...rest}
        ref={forwardedRef}
        status={status}
        hasAction={hasAction}
        css={css}
        className='ToastRoot'
      >
        {icon ? (
          <Box as='span' css={{ mr: '$5', lineHeight: 1, size: '$1' }}>
            <Icon css={{ color: 'white' }} icon={icon} />
          </Box>
        ) : null}
        <ToastDescription>{message}</ToastDescription>
        {onDelete || onUndo ? (
          <ToastAction className='ToastAction'>
            {onUndo ? (
              <Button
                color={status as IButtonProps['color']}
                css={{ ml: '$4' }}
                onClick={() => onUndo(id)}
                data-testid='undo-toast'
              >
                Undo
              </Button>
            ) : null}
            {onDelete ? (
              <IconButton
                css={{ ml: '$4' }}
                color={status as ColorPaletteType}
                icon={<IconX />}
                data-testid='delete-toast'
                onClick={() => onDelete(id)}
              />
            ) : null}
          </ToastAction>
        ) : null}
      </ToastRoot>
    );
  },
);

ToastItem.displayName = 'ToastItem';
export default React.memo(ToastItem);
