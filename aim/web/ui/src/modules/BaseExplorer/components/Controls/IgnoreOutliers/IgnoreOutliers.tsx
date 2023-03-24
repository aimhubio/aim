import * as React from 'react';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';
import { Button, Icon, Text } from 'components/kit';

import { IIgnoreOutliersProps } from './index';

function IgnoreOutliers(props: IIgnoreOutliersProps) {
  const {
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const ignoreOutliers = useStore(
    vizEngine.controls.ignoreOutliers.stateSelector,
  );
  const updateIgnoreOutliers = vizEngine.controls.ignoreOutliers.methods.update;

  return (
    <ErrorBoundary>
      <Tooltip
        title={
          ignoreOutliers.isApplied ? 'Outliers are ignored' : 'Ignore outliers'
        }
      >
        <div>
          <Button
            size='xSmall'
            className={classNames('Control__anchor', {
              active: ignoreOutliers.isApplied,
              outlined: ignoreOutliers.isApplied,
            })}
            onClick={() => {
              updateIgnoreOutliers({ isApplied: !ignoreOutliers.isApplied });
            }}
          >
            <Icon
              name='ignore-outliers'
              className={classNames('Control__anchor__icon', {
                active: ignoreOutliers.isApplied,
              })}
            />
            <Text className='Control__anchor__label'>Ignore Outliers</Text>
          </Button>
        </div>
      </Tooltip>
    </ErrorBoundary>
  );
}

IgnoreOutliers.displayName = 'IgnoreOutliers';

export default React.memo(IgnoreOutliers);
