import { makeStyles } from '@material-ui/core';

export default makeStyles(({ spacing }) => ({
  chartContainer: {
    height: '-webkit-fill-available',
  },
  chartPanel: {
    height: '100%',
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
  popover: {
    pointerEvents: 'none',
  },
  popoverContent: {
    margin: '1em',
    minWidth: 250,
  },
}));
