import React from 'react';

import { MenuItem } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';
import { MetricsValueKeyEnum } from 'config/enums/tableEnums';

import { AppNameEnum } from 'services/models/explorer';

import './MetricsValueKeyPopover.scss';

function MetricsValueKeyPopover({
  metricsValueKey,
  onMetricsValueKeyChange,
  appName,
}: any) {
  const metricsValueKeyChanged: boolean = React.useMemo(() => {
    return (
      metricsValueKey !==
      TABLE_DEFAULT_CONFIG[appName as AppNameEnum]?.metricsValueKey
    );
  }, [appName, metricsValueKey]);

  return (
    <ErrorBoundary>
      <ControlPopover
        title='Select metrics value'
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
            className={`MetricsValueKeyPopover__trigger ${
              opened || metricsValueKeyChanged ? 'opened' : ''
            }`}
          >
            <Icon name='metric-value' />
            <Text size={14} tint={100}>
              {metricsValueKey} Value
            </Text>
          </Button>
        )}
        component={
          <div className='MetricsValueKeyPopover'>
            <MenuItem
              selected={metricsValueKey === MetricsValueKeyEnum.FIRST}
              onClick={() => onMetricsValueKeyChange(MetricsValueKeyEnum.FIRST)}
            >
              First Value
            </MenuItem>
            <MenuItem
              selected={metricsValueKey === MetricsValueKeyEnum.MAX}
              onClick={() => onMetricsValueKeyChange(MetricsValueKeyEnum.MAX)}
            >
              Max Value
            </MenuItem>
            <MenuItem
              selected={metricsValueKey === MetricsValueKeyEnum.MIN}
              onClick={() => onMetricsValueKeyChange(MetricsValueKeyEnum.MIN)}
            >
              Min Value
            </MenuItem>
            <MenuItem
              selected={metricsValueKey === MetricsValueKeyEnum.LAST}
              onClick={() => onMetricsValueKeyChange(MetricsValueKeyEnum.LAST)}
            >
              Last Value
            </MenuItem>
          </div>
        }
      />
    </ErrorBoundary>
  );
}

export default React.memo(MetricsValueKeyPopover);
