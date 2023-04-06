import { styled } from 'config/stitches';

import Box from '../Box';

const FormGroupRow = styled(Box, {
  display: 'flex',
  ai: 'center',
});

const FormGroupContainer = styled(Box, {});

const FormGroupSection = styled(Box, {
  display: 'flex',
  fd: 'column',
  p: '$7',
  gap: '4px',
  borderBottom: '1px solid $border10',
  '&:last-child': {
    borderBottom: 'none',
  },
});

const FormGroupActions = styled(Box, {
  ml: '$5',
  display: 'flex',
  ai: 'center',
  gap: '2px',
});

const FormGroupControl = styled(Box, {
  ml: '$5',
  minWidth: 'fit-content',
});

const FormGroupContent = styled(Box, {
  display: 'flex',
  flex: 1,
});
export {
  FormGroupRow,
  FormGroupContainer,
  FormGroupSection,
  FormGroupActions,
  FormGroupControl,
  FormGroupContent,
};
