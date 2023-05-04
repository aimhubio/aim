import React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Button, Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary';

import { TooltipAppearanceEnum } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

import { IAppearanceActionButtonsProps } from '../index';

import './AppearanceActionButtons.scss';

function AppearanceActionButtons(props: IAppearanceActionButtonsProps) {
  const { onChangeAppearance, appearance } = props;
  return (
    <ErrorBoundary>
      <div className='ActionButtons'>
        <Tooltip title='Pin to top'>
          <div>
            <Button
              onClick={() => onChangeAppearance(TooltipAppearanceEnum.Top)}
              withOnlyIcon
              size='xSmall'
              className={classNames('ActionButtons__actionButton', {
                active: appearance === TooltipAppearanceEnum.Top,
              })}
            >
              <Icon
                name='pin-to-top'
                fontSize={16}
                className='ActionButtons__actionButton__icon'
              />
            </Button>
          </div>
        </Tooltip>
        <Tooltip title='Flexible'>
          <div>
            <Button
              onClick={() => onChangeAppearance(TooltipAppearanceEnum.Auto)}
              withOnlyIcon
              size='xSmall'
              className={classNames('ActionButtons__actionButton', {
                active: appearance === TooltipAppearanceEnum.Auto,
              })}
            >
              <Icon
                name='flexible'
                fontSize={16}
                className='ActionButtons__actionButton__icon'
              />
            </Button>
          </div>
        </Tooltip>
        <Tooltip title='Pin to bottom'>
          <div>
            <Button
              onClick={() => onChangeAppearance(TooltipAppearanceEnum.Bottom)}
              withOnlyIcon
              size='xSmall'
              className={classNames('ActionButtons__actionButton', {
                active: appearance === TooltipAppearanceEnum.Bottom,
              })}
            >
              <Icon
                name='pin-to-bottom'
                fontSize={16}
                className='ActionButtons__actionButton__icon'
              />
            </Button>
          </div>
        </Tooltip>
      </div>
    </ErrorBoundary>
  );
}
export default React.memo(AppearanceActionButtons);
