import React, { memo } from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import ExperimentRunsTable from './ExperimentRunsTable';

import { IExperimentRunsTabProps } from '.';

import './ExperimentRunsTab.scss';

function ExperimentRunsTab({
  experimentName,
  experimentId,
}: IExperimentRunsTabProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div className='ExperimentRunsTab'>
        <div className='ExperimentRunsTab__content'>
          <ExperimentRunsTable
            experimentName={experimentName}
            experimentId={experimentId}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default memo(ExperimentRunsTab);
