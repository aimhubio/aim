import { makeStyles } from '@material-ui/core';

export default makeStyles(({ spacing }) => ({
  paper: {
    padding: spacing(1),
    height: '100%',
  },
  fullHeight: {
    height: '-webkit-fill-available',
  },
  section: {
    padding: spacing(0.5),
  },
}));
