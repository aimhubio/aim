import { makeStyles } from '@material-ui/core';

export default makeStyles(() => ({
  chart: {
    backgroundColor: 'white',
    height: '100%',
    width: '100%',
    '& .backgroundRect': {
      cursor: 'crosshair',
    },
    '&.zoomMode rect': {
      cursor: 'zoom-in',
    },
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none',
  },
}));
