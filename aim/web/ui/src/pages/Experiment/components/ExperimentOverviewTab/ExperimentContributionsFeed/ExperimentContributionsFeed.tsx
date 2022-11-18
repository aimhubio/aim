import React from 'react';

import ContributionsFeed from 'components/ContributionsFeed';

import useExperimentContributionsFeed from './useExperimentContributionsFeed';

import { IExperimentContributionsFeedProps } from '.';

function ExperimentContributionsFeed({
  experimentId,
  experimentName,
}: IExperimentContributionsFeedProps): React.FunctionComponentElement<React.ReactNode> | null {
  const props = useExperimentContributionsFeed(experimentId, experimentName);
  return <ContributionsFeed {...props} />;
}

export default React.memo(ExperimentContributionsFeed);
