import React from 'react';

import Tooltip from '@material-ui/core/Tooltip';

import { Button, Text } from 'components/kit';

import { IActionCardProps } from './ActionCard.d';

import './ActionCard.scss';

function ActionCard({
  title,
  description,
  btnTooltip,
  btnText,
  onAction,
  btnProps,
}: IActionCardProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='ActionCard'>
      <div className='ActionCard__infoBox'>
        <Text component='h4' weight={600} size={14} tint={100}>
          {title}
        </Text>
        <Text
          component='p'
          tint={100}
          weight={400}
          className='ActionCard__infoBox__message'
        >
          {description}
        </Text>
      </div>

      <Tooltip title={btnTooltip} placement='top'>
        <Button onClick={onAction} {...btnProps}>
          {btnText}
        </Button>
      </Tooltip>
    </div>
  );
}

ActionCard.displayName = 'ActionCard';

export default React.memo<IActionCardProps>(ActionCard);
