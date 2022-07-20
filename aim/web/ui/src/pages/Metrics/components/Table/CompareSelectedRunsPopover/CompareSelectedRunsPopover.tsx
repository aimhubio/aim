import React from 'react';
import _ from 'lodash-es';

import { MenuItem } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon, Text } from 'components/kit';

import { EXPLORE_SELECTED_RUNS_CONFIG } from 'config/table/tableConfigs';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import { AppNameEnum } from 'services/models/explorer';
import * as analytics from 'services/analytics';

import { encode } from 'utils/encoder/encoder';

import { ICompareSelectedRunsProps } from './CompareSelectedRuns';

import './CompareSelectedRunsPopover.scss';

function CompareSelectedRunsPopover({
  selectedRows,
  appName,
}: ICompareSelectedRunsProps): React.FunctionComponentElement<React.ReactNode> {
  const onCompare = React.useCallback(
    ({ value }: { value: string }) => {
      if (value) {
        const runHashArray: string[] = _.uniq([
          ...Object.values(selectedRows).map((row: any) => row.runHash),
        ]);
        const q = `run.hash in [${runHashArray
          .map((hash) => {
            return `"${hash}"`;
          })
          .join(',')}]`;
        const search = encode({
          query: q,
          advancedMode: true,
          advancedQuery: q,
        });
        analytics.trackEvent(
          ANALYTICS_EVENT_KEYS[appName].table.compareSelectedRuns,
        );
        window.open(`/${value}?select=${search}`, '_blank');
        window.focus();
      }
    },
    [appName, selectedRows],
  );
  return (
    <ErrorBoundary>
      <ErrorBoundary>
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
              size='small'
              onClick={onAnchorClick}
              className={`CompareSelectedRunsPopover__trigger ${
                opened ? 'opened' : ''
              }`}
            >
              <Icon name='search' />
              <Text size={14} tint={100}>
                Explore
              </Text>
            </Button>
          )}
          component={
            <div className='CompareSelectedRunsPopover'>
              {EXPLORE_SELECTED_RUNS_CONFIG[appName as AppNameEnum].map(
                (item: any) => (
                  <MenuItem
                    className='CompareSelectedRunsPopover__item'
                    onClick={() => onCompare(item)}
                    key={item.label}
                  >
                    <Icon box name={item.value} />
                    <Text size={14} tint={100}>
                      {item.label}
                    </Text>
                  </MenuItem>
                ),
              )}
            </div>
          }
        />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}

CompareSelectedRunsPopover.displayName = 'CompareSelectedRunsPopover';

export default React.memo(CompareSelectedRunsPopover);
