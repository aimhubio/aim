import { makeStyles } from '@material-ui/core';

export default makeStyles(() => ({
  anchor: {
    cursor: 'pointer',
    '&:hover .arrowLeft': {
      opacity: 1,
    },
    '&.disabled': {
      opacity: 0.2,
      cursor: 'unset',
    },
  },
  anchorArrow: {
    position: 'absolute',
    left: -18,
    '&.arrowLeft': {
      opacity: 0,
      width: 18,
      transition: 'all .3s ease-out',
    },
    '&.opened > .arrowLeft': {
      opacity: 1,
      transform: 'rotate(180deg)',
    },
  },
}));
