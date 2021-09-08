import React from 'react';
import _ from 'lodash-es';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';
import { IZoomOutPopoverProps } from 'types/components/ZoomOutPopover/ZoomOutPopover';

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
    <Box>
      <Box p={0.5}>Select Option To Zoom Out</Box>
      <Divider />
      <MenuList>
        {Object.keys(groupedHistory)?.map((index) => (
          <MenuItem key={index} data-name={index} onClick={handleZoomOut}>
            {`Zoom Out Chart ${parseInt(index) + 1}`}
          </MenuItem>
        ))}
        <MenuItem onClick={handleResetZooming}>Reset Zooming</MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(ZoomOutPopover);
