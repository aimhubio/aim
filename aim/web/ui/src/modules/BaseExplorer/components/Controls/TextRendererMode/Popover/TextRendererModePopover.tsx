import React, { ChangeEvent } from 'react';
import _ from 'lodash-es';

import { Divider } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ITextRendererModePopoverProps } from '.';

import './TextRendererModePopover.scss';

function TextRendererModePopover(props: ITextRendererModePopoverProps) {
  const { reset, update, textRenderer, updateDelay = 100 } = props;

  return (
    <ErrorBoundary>
      <div className='TextRendererModePopover'>
        <div className='TextRendererModePopover__section'>
          <div className='TextRendererModePopover__item'></div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

TextRendererModePopover.displayName = 'TextRendererModePopover';

export default React.memo<ITextRendererModePopoverProps>(
  TextRendererModePopover,
);
