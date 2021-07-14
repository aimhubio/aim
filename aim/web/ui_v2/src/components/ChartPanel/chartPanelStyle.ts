import { makeStyles } from '@material-ui/core';

export default makeStyles(({ spacing }) => ({
  container: {
    height: '-webkit-fill-available',
  },
  paper: {
    padding: spacing(1),
    height: '100%',
    userSelect: 'none',
  },
  chartGrid: {
    height: '100%',
    overflow: 'auto',
  },
}));
