import * as React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import ControlPopover from 'components/ControlPopover';
import ErrorBoundary from 'components/ErrorBoundary';

import AggregationPopover from './Popover';

import { IAggregationProps, IAggregationConfig } from './index';

function Aggregation(props: IAggregationProps) {
  const {
    engine,
    visualizationName,
    engine: { useStore, visualizations, groupings },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const isGroupingEmpty = engine.useStore(groupings.isEmptySelector);

  const aggregation: IAggregationConfig = useStore(
    vizEngine.controls.aggregation.stateSelector,
  );
  const updateAggregationConfig = vizEngine.controls.aggregation.methods.update;

  React.useEffect(() => {
    if (isGroupingEmpty && aggregation.isApplied) {
      updateAggregationConfig({ isApplied: false });
    }
  }, [isGroupingEmpty, aggregation.isApplied, updateAggregationConfig]);

  return (
    <ErrorBoundary>
      <ControlPopover
        title='Configure aggregation methods'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip
            title={
              aggregation.isApplied
                ? 'Deaggregate metrics'
                : 'Aggregate metrics'
            }
          >
            <div>
              <Button
                size='xSmall'
                className={classNames('Control__anchor', {
                  active: aggregation.isApplied,
                  outlined: aggregation.isApplied,
                  disabled: isGroupingEmpty,
                })}
                onClick={() => {
                  if (!isGroupingEmpty) {
                    updateAggregationConfig({
                      isApplied: !aggregation?.isApplied,
                    });
                  }
                }}
              >
                <Icon
                  name='aggregation'
                  className={classNames('Control__anchor__icon', {
                    active: aggregation.isApplied,
                  })}
                />
                <Text className='Control__anchor__label'>Aggregate</Text>
                <Icon
                  name='arrow-down-contained'
                  onClick={onAnchorClick}
                  className={classNames('Control__anchor__arrow', { opened })}
                  fontSize={6}
                />
              </Button>
            </div>
          </Tooltip>
        )}
        component={
          <AggregationPopover
            engine={engine}
            visualizationName={visualizationName}
          />
        }
      />
    </ErrorBoundary>
  );
}

Aggregation.displayName = 'Aggregation';

export default React.memo(Aggregation);
