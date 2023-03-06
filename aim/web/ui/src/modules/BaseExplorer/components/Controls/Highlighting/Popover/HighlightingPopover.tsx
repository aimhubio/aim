import React from 'react';

import { MenuItem } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';

import { HighlightEnum } from 'utils/d3';

import { IHighlightingConfig } from '../index';

import { IHighlightingPopoverProps } from './index';

import './HighlightingPopover.scss';

function HighlightingPopover(props: IHighlightingPopoverProps) {
  const {
    visualizationName,
    engine: { visualizations, useStore },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const highlighting: IHighlightingConfig = useStore(
    vizEngine.controls.highlighting.stateSelector,
  );
  const updateHighlightingConfig =
    vizEngine.controls.highlighting.methods.update;

  const onHighlightingChange = React.useCallback(
    (e: React.ChangeEvent<any>): void => {
      const value = e.target?.getAttribute('data-name');
      if (value) {
        const parsedValue = parseInt(value);
        if (highlighting.mode !== parsedValue) {
          updateHighlightingConfig({ mode: parsedValue });
        }
      }
    },
    [highlighting.mode, updateHighlightingConfig],
  );

  return (
    <ErrorBoundary>
      <div className='HighlightingPopover'>
        <MenuItem
          data-name={HighlightEnum.Off}
          selected={highlighting.mode === HighlightEnum.Off}
          onClick={onHighlightingChange}
        >
          Highlight Off
        </MenuItem>
        <MenuItem
          data-name={HighlightEnum.Metric}
          selected={highlighting.mode === HighlightEnum.Metric}
          onClick={onHighlightingChange}
        >
          Highlight Metric on Hover
        </MenuItem>
        <MenuItem
          data-name={HighlightEnum.Run}
          selected={highlighting.mode === HighlightEnum.Run}
          onClick={onHighlightingChange}
        >
          Highlight Run On Hover
        </MenuItem>
      </div>
    </ErrorBoundary>
  );
}

HighlightingPopover.displayName = 'HighlightingPopover';

export default React.memo(HighlightingPopover);
