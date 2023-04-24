import React from 'react';

import { MenuItem } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { RowHeightSize, TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';

import { AppNameEnum } from 'services/models/explorer';

import './RowHeightPopover.scss';

function RowHeightPopover({ rowHeight, onRowHeightChange, appName }: any) {
  const rowHeightChanged: boolean = React.useMemo(() => {
    return (
      rowHeight !== TABLE_DEFAULT_CONFIG[appName as AppNameEnum]?.rowHeight
    );
  }, [appName, rowHeight]);

  return (
    <ErrorBoundary>
      <ControlPopover
        title='Select content density mode'
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        anchor={({ onAnchorClick, opened }) => (
          <Button
            variant='text'
            color='secondary'
            size='small'
            onClick={onAnchorClick}
            className={`RowHeightPopover__trigger ${
              opened || rowHeightChanged ? 'opened' : ''
            }`}
          >
            <Icon name='row-height' />
            <Text size={14} tint={100}>
              Row Height
            </Text>
          </Button>
        )}
        component={
          <div className='RowHeightPopover'>
            <MenuItem
              selected={rowHeight === RowHeightSize.sm}
              onClick={() => onRowHeightChange(RowHeightSize.sm)}
            >
              Compact
            </MenuItem>
            <MenuItem
              selected={rowHeight === RowHeightSize.md}
              onClick={() => onRowHeightChange(RowHeightSize.md)}
            >
              Normal
            </MenuItem>
          </div>
        }
      />
    </ErrorBoundary>
  );
}

export default React.memo(RowHeightPopover);
