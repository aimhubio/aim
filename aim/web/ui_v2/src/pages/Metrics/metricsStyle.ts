import { makeStyles } from '@material-ui/core';

export default makeStyles(({ spacing }) => ({
  paper: {
    padding: spacing(1),
    height: '100%',
    userSelect: 'none',
  },
  fullHeight: {
    height: '100%',
  },
  section: {
    padding: spacing(0.5),
  },
  resize: {
    cursor: 'ns-resize',
  },
}));
