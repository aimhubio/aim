import { makeStyles } from '@material-ui/core';

export default makeStyles((theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  popoverContent: {
    margin: '1em',
    width: 250,
    height: 60,
  },
}));
