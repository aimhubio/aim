import React from 'react';
import _ from 'lodash-es';

import { MenuItem } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IZoomOutPopoverProps } from 'types/components/ZoomOutPopover/ZoomOutPopover';

import './ZoomOutPopover.scss';

function ZoomOutPopover({
  zoomHistory = [],
  onChange,
}: IZoomOutPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const groupedHistory = _.groupBy(zoomHistory, (item) => item.index);

  function handleZoomOut(e: React.ChangeEvent<any>): void {
    const value = e.target?.getAttribute('data-name');
    if (value && typeof onChange === 'function') {
      const index = _.findLastIndex(
        zoomHistory,
        (item) => item.index === parseInt(value),
      );
      let changedHistory = [...zoomHistory];
      if (index || index === 0) {
        changedHistory.splice(index, 1);
      }
      onChange({ history: changedHistory, active: false });
    }
  }

  function handleResetZooming() {
    if (typeof onChange === 'function') {
      onChange?.({ history: [], active: false });
    }
  }
  return (
    <ErrorBoundary>
      <div className='ZoomOutPopover'>
        {Object.keys(groupedHistory)?.map((index) => (
          <MenuItem key={index} data-name={index} onClick={handleZoomOut}>
            {`Zoom Out Chart ${parseInt(index) + 1}`}
          </MenuItem>
        ))}
        <MenuItem onClick={handleResetZooming}>Reset Zooming</MenuItem>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(ZoomOutPopover);
