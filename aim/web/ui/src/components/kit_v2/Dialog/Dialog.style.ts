import * as DialogPrimitive from '@radix-ui/react-dialog';

import { keyframes, styled } from 'config/stitches';

import Box from '../Box';

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

const DialogOverlay = styled(DialogPrimitive.Overlay, {
  bc: 'hsla(206, 22%, 7%, 0.5)',
  position: 'fixed',
  inset: 0,
  zIndex: 11,
  animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
});

const DialogContent = styled(DialogPrimitive.Content, {
  position: 'fixed',
  top: '50%',
  left: '50%',
  bc: 'white',
  br: '$5',
  bs: '0px 2px 4px -4px rgba(54, 61, 73, 0.25)',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '450px',
  maxHeight: '85vh',
  p: '$9',
  animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  zIndex: 12,
  '&:focus': { outline: 'none' },
});

const DialogTitle = styled(DialogPrimitive.Title, {
  fontSize: '$4',
  fontWeight: '$4',
  color: '$textPrimary',
  wordBreak: 'break-word',
});

const DialogDescription = styled(DialogPrimitive.Description, {
  margin: '$7 0',
  fontSize: '$3',
  color: '$textPrimary',
  lineHeight: 1.5,
});

const DialogActions = styled(Box, {
  borderTop: '1px solid $colors$secondary20',
  pt: '$5',
  mt: '$9',
  display: 'flex',
  ai: 'center',
  jc: 'flex-end',
});

export {
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogActions,
};
