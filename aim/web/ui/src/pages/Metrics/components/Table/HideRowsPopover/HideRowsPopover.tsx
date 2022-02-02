import React from 'react';

import { MenuItem } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';

import './HideRowsPopover.scss';

function HideRowsPopover({
  toggleRowsVisibility,
  hiddenChartRows,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ControlPopover
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      anchor={({ onAnchorClick, opened }) => (
        <Button
          variant='text'
          color='secondary'
          onClick={onAnchorClick}
          className={`HideRowsPopover__trigger ${
            opened || hiddenChartRows ? 'opened' : ''
          }`}
        >
          <Icon name='eye-outline-hide' />
          <Text size={14} tint={100}>
            Hide Rows
          </Text>
        </Button>
      )}
      component={
        <div className='HideRowsPopover'>
          <MenuItem
            className={hiddenChartRows ? '' : 'HideRowsPopover__active'}
            onClick={() => toggleRowsVisibility([])}
          >
            Visualize All Rows
          </MenuItem>
          <MenuItem
            className={hiddenChartRows ? 'HideRowsPopover__active' : ''}
            onClick={() => toggleRowsVisibility(['all'])}
          >
            Hide All Rows
          </MenuItem>
        </div>
      }
    />
  );
}

export default React.memo(HideRowsPopover);
