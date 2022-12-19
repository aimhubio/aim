import React from 'react';

import ContributionsFeed from 'components/ContributionsFeed';

import useDashboardContributionsFeed from './useDashboardContributionsFeed';

function DashboardContributionsFeed(): React.FunctionComponentElement<React.ReactNode> | null {
  const props = useDashboardContributionsFeed();

  return <ContributionsFeed {...props} />;
}

export default React.memo(DashboardContributionsFeed);
