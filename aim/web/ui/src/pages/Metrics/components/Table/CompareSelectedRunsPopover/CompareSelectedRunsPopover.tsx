import React from 'react';
import _ from 'lodash-es';
import { useHistory } from 'react-router-dom';

import { MenuItem, Tooltip } from '@material-ui/core';

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
  const history = useHistory();

  const onCompare: (
    e: React.MouseEvent<HTMLElement>,
    value: string,
    newTab?: boolean,
  ) => void = React.useCallback(
    (e: React.MouseEvent<HTMLElement>, value: string, newTab = false) => {
      e.stopPropagation();
      e.preventDefault();
      if (value) {
        const runHashArray: string[] = _.uniq([
          ...Object.values(selectedRows).map((row: any) => row.runHash),
        ]);

        const query = `run.hash in [${runHashArray
          .map((hash) => `"${hash}"`)
          .join(',')}]`;

        const search = encode({
          query,
          advancedMode: true,
          advancedQuery: query,
        });

        analytics.trackEvent(
          ANALYTICS_EVENT_KEYS[appName].table.compareSelectedRuns,
        );
        const path = `/${value}?select=${search}`;
        if (newTab) {
          window.open(path, '_blank');
          window.focus();
          return;
        }
        history.push(path);
      }
    },
    [appName, history, selectedRows],
  );

  return (
    <ErrorBoundary>
      <ControlPopover
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
            className={`CompareSelectedRunsPopover__trigger ${
              opened ? 'opened' : ''
            }`}
          >
            <Icon fontSize={18} name='compare' />
            <Text size={14} tint={100}>
              Compare
            </Text>
          </Button>
        )}
        component={
          <div className='CompareSelectedRunsPopover'>
            {EXPLORE_SELECTED_RUNS_CONFIG[appName as AppNameEnum].map(
              (item: AppNameEnum) => (
                <MenuItem
                  className='CompareSelectedRunsPopover__item'
                  key={item}
                >
                  <Icon box name={item as any} />
                  <Text
                    size={14}
                    tint={100}
                    onClick={(e) => onCompare(e, item)}
                    className='CompareSelectedRunsPopover__item-explorerName'
                  >
                    {item}
                  </Text>
                  <Tooltip title='Compare in new tab'>
                    <div>
                      <Button
                        color='secondary'
                        size='small'
                        withOnlyIcon
                        onClick={(e) => onCompare(e, item, true)}
                      >
                        <Text size={8}>
                          <Icon name='back-up-right' />
                        </Text>
                      </Button>
                    </div>
                  </Tooltip>
                </MenuItem>
              ),
            )}
          </div>
        }
      />
    </ErrorBoundary>
  );
}

CompareSelectedRunsPopover.displayName = 'CompareSelectedRunsPopover';

export default React.memo(CompareSelectedRunsPopover);
