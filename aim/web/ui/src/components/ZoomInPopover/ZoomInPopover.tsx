import React from 'react';

import { MenuItem } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IZoomInPopoverProps } from 'types/components/ZoomInPopover/ZoomInPopover';

import './ZoomInPopover.scss';

export enum ZoomEnum {
  SINGLE = 0,
  MULTIPLE = 1,
}

function ZoomInPopover({
  mode,
  onChange,
}: IZoomInPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function handleChange(e: React.ChangeEvent<any>): void {
    const value = e.target?.getAttribute('data-name');
    if (value && mode !== parseInt(value) && typeof onChange === 'function') {
      onChange({ mode: parseInt(value), active: true });
    }
  }
  return (
    <ErrorBoundary>
      <div className='ZoomInPopover'>
        <MenuItem
          data-name={ZoomEnum.SINGLE}
          selected={mode === ZoomEnum.SINGLE}
          onClick={handleChange}
        >
          Single Zooming
        </MenuItem>
        <MenuItem
          data-name={ZoomEnum.MULTIPLE}
          selected={mode === ZoomEnum.MULTIPLE}
          onClick={handleChange}
        >
          Multiple Zooming
        </MenuItem>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(ZoomInPopover);
