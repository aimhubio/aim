import React, { memo } from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IExperimentRunsTabProps, useExperimentRuns } from '.';

import './ExperimentRunsTab.scss';

function ExperimentRunsTab({
  experimentId,
  experimentName,
}: IExperimentRunsTabProps): React.FunctionComponentElement<React.ReactNode> {
  const props = useExperimentRuns(experimentId, experimentName);
  console.log(props);
  return (
    <ErrorBoundary>
      <div className='ExperimentRunsTab'></div>
    </ErrorBoundary>
  );
}

export default memo(ExperimentRunsTab);
