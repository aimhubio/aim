import { Box } from 'components/kit_v2';

import { styled } from '..';

/**
 * @description The LayoutContainer component is the main container for the app. It centers the content and adds some padding to the left and right.
 */
const LayoutContainer = styled(Box, {
  maxWidth: '1358px',
  m: '0 auto', // Centers the container horizontally
  p: '0 $9', // Adds some padding to the left and right of the container
});

/**
 * @description The TopBar component is the top bar of the app. It is fixed to the top of the screen and has a height of 28px.
 */
const TopBar = styled(Box, {
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #B4BFCA',
  bs: '0px 3px 0px rgba(0, 0, 0, 0.08)',
  p: '0 $9',
});

const textEllipsis = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%',
};

export { LayoutContainer, TopBar, textEllipsis };
