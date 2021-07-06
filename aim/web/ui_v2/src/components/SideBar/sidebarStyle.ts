import { makeStyles } from '@material-ui/core';

export default makeStyles(({ spacing, palette }) => ({
  paper: {
    width: spacing(4.375),
    backgroundColor: palette.primary.main,
  },
  logo: {
    width: spacing(2.1875),
    margin: 'auto',
  },
  list: {
    padding: 0,
  },
  listItem: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing(0.1875, 0),
    padding: spacing(0.5),
  },
  listItemText: {
    fontSize: spacing(0.875),
    color: '#fff',
  },
  anchor: {
    position: 'relative',
    textDecoration: 'none',
    color: palette.text.secondary,
  },
  anchorActive: {
    display: 'block',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: '20%',
      left: 0,
      height: '60%',
      width: spacing(0.1875),
      backgroundColor: '#fff',
      borderRadius: `0 ${spacing(0.625)} ${spacing(0.625)} 0`,
    },
  },
}));
