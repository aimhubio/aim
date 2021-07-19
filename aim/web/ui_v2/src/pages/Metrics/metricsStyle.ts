import { makeStyles } from '@material-ui/core';

export default makeStyles(({ spacing }) => ({
  paper: {
    padding: spacing(1),
    height: '100%',
    userSelect: 'none',
  },
  fullHeight: {
    height: '-webkit-fill-available',
    overflow: 'scroll',
  },
  section: {
    padding: spacing(0.5),
  },
  resize: {
    cursor: 'ns-resize',
  },
  chartContainer: {
    flex: '0.5 1 0',
    minHeight: 420,
  },
  tableContainer: {
    flex: '0.5 1 0',
  },
}));
