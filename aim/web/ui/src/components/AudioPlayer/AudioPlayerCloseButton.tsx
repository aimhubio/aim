import * as React from 'react';
import cx from 'classnames';

import Close from '@material-ui/icons/Close';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { IAudioPlayerColors, Icons } from './AudioPlayer';

export const useComponentStyles = makeStyles({
  icon: (props: any) => ({
    color: props.playerColors.active,
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 16,
    cursor: 'pointer',
    '&:hover': {
      color: props.playerColors.hover,
    },
  }),
});

interface IAudioPlayControlProps {
  playerColors: IAudioPlayerColors;
  onClose: () => void;
  icons?: Icons;
  classNames?: any;
}

const AudioPlayCloseButton: React.FunctionComponent<IAudioPlayControlProps> = ({
  playerColors,
  onClose,
  icons = {},
  classNames = {},
}) => {
  const { CloseIcon = Close } = icons;
  const classes = useComponentStyles({ playerColors });
  return (
    <CloseIcon
      onClick={onClose}
      className={cx(classes.icon, classNames.closeIcon)}
    />
  );
};

export default React.memo(AudioPlayCloseButton);
