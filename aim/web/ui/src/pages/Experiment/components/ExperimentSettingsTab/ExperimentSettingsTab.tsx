import React, { memo } from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NameAndDescriptionCard from 'components/NameAndDescriptionCard';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IExperimentSettingsTabProps } from '.';

import './ExperimentSettingsTab.scss';

function ExperimentSettingsTab({
  experimentName,
  description,
  updateExperiment,
}: IExperimentSettingsTabProps): React.FunctionComponentElement<React.ReactNode> {
  React.useEffect(() => {
    analytics.pageView(ANALYTICS_EVENT_KEYS.experiment.tabs.settings.tabView);
  }, []);

  function onSave(name: string, description: string) {
    updateExperiment(name, description);
  }

  return (
    <ErrorBoundary>
      <div className='ExperimentSettingsTab'>
        <div className='ExperimentSettingsTab__actionCardsCnt'>
          <NameAndDescriptionCard
            title='Experiment Properties'
            defaultName={experimentName ?? ''}
            defaultDescription={description ?? ''}
            onSave={onSave}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default memo(ExperimentSettingsTab);
