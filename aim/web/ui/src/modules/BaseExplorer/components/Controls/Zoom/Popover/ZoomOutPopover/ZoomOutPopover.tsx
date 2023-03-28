import React from 'react';
import * as _ from 'lodash-es';

import { MenuItem } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';

import { IZoomConfig } from '../../';

import { IZoomOutPopoverProps } from './index';

import './ZoomOutPopover.scss';

function ZoomOutPopover(props: IZoomOutPopoverProps) {
  const {
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const zoom: IZoomConfig = useStore(vizEngine.controls.zoom.stateSelector);
  const updateZoomConfig = vizEngine.controls.zoom.methods.update;

  const groupedHistory = React.useMemo(
    () => _.groupBy(zoom.history, (item) => item.id),
    [zoom.history],
  );

  const onZoomOut = React.useCallback(
    (e: React.ChangeEvent<any>): void => {
      const value = e.target?.getAttribute('data-name');
      if (!value) return;

      const index = _.findLastIndex(zoom.history, (item) => item.id === value);
      const changedHistory = [...zoom.history];
      if (index || index === 0) {
        changedHistory.splice(index, 1);
      }
      updateZoomConfig({ history: changedHistory, active: false });
    },
    [zoom.history, updateZoomConfig],
  );

  const onResetZoom = React.useCallback((): void => {
    updateZoomConfig({ history: [], active: false });
  }, [updateZoomConfig]);

  return (
    <ErrorBoundary>
      <div className='ZoomOutPopover'>
        {Object.keys(groupedHistory)?.map((id) => (
          <MenuItem key={id} data-name={id} onClick={onZoomOut}>
            {`Zoom Out Chart ${id}`}
          </MenuItem>
        ))}
        <MenuItem onClick={onResetZoom}>Reset Zooming</MenuItem>
      </div>
    </ErrorBoundary>
  );
}

ZoomOutPopover.displayName = 'ZoomOutPopover';

export default React.memo(ZoomOutPopover);
