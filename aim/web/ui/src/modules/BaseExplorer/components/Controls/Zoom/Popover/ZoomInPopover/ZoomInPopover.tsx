import React from 'react';

import { MenuItem } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';

import { ZoomEnum } from 'utils/d3';

import { IZoomConfig } from '../../';

import { IZoomInPopoverProps } from './';

import './ZoomInPopover.scss';

function ZoomInPopover(props: IZoomInPopoverProps) {
  const {
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const zoom: IZoomConfig = useStore(vizEngine.controls.zoom.stateSelector);
  const updateZoomConfig = vizEngine.controls.zoom.methods.update;

  const onZoomModeChange = React.useCallback(
    (e: React.ChangeEvent<any>): void => {
      const value = e.target?.getAttribute('data-name');
      if (value && zoom.mode !== parseInt(value)) {
        updateZoomConfig({ mode: parseInt(value), active: true });
      }
    },
    [zoom.mode, updateZoomConfig],
  );

  return (
    <ErrorBoundary>
      <div className='ZoomInPopover'>
        <MenuItem
          data-name={ZoomEnum.MULTIPLE}
          selected={zoom.mode === ZoomEnum.MULTIPLE}
          onClick={onZoomModeChange}
        >
          Multiple Zooming
        </MenuItem>
        <MenuItem
          data-name={ZoomEnum.SINGLE}
          selected={zoom.mode === ZoomEnum.SINGLE}
          onClick={onZoomModeChange}
        >
          Single Zooming
        </MenuItem>
      </div>
    </ErrorBoundary>
  );
}

ZoomInPopover.displayName = 'ZoomInPopover';

export default React.memo(ZoomInPopover);
