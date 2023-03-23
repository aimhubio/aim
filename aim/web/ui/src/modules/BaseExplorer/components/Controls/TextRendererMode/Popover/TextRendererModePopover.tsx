import * as React from 'react';
import _ from 'lodash-es';

import { MenuItem } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { TEXT_RNDERER_MODES } from 'pages/TextExplorer/textConfig';

import { ITextRendererModePopoverProps } from '.';

import './TextRendererModePopover.scss';

function TextRendererModePopover(props: ITextRendererModePopoverProps) {
  const { update, textRenderer } = props;

  return (
    <ErrorBoundary>
      <div className='TextRendererModePopover'>
        <div className='TextRendererModePopover__section'>
          {Object.keys(TEXT_RNDERER_MODES).map((key) => (
            <MenuItem
              key={key}
              property='line'
              selected={key.toLowerCase() === textRenderer.type}
              onClick={() =>
                update({
                  type: key.toLowerCase(),
                })
              }
            >
              {key.toUpperCase()}
            </MenuItem>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}

TextRendererModePopover.displayName = 'TextRendererModePopover';

export default React.memo<ITextRendererModePopoverProps>(
  TextRendererModePopover,
);
