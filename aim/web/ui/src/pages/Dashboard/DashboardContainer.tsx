import React from 'react';
import { useModel } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import homeAppModel from 'services/models/home/homeAppModel';
import * as analytics from 'services/analytics';

import Home from './Dashboard';

function HomeContainer(): React.FunctionComponentElement<React.ReactNode> {
  const homeData = useModel(homeAppModel);

  React.useEffect(() => {
    homeAppModel.initialize();
    analytics.trackEvent(ANALYTICS_EVENT_KEYS.home.pageView);
    return () => {
      homeAppModel.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Home
        onSendEmail={homeAppModel.onSendEmail}
        activityData={homeData.activityData}
        notifyData={homeData.notifyData}
        askEmailSent={homeData.askEmailSent}
        experimentsData={homeData.experimentsData}
        onNotificationDelete={homeAppModel.onHomeNotificationDelete}
      />
    </ErrorBoundary>
  );
}
export default HomeContainer;
