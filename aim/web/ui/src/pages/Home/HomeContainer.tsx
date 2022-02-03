import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import useModel from 'hooks/model/useModel';

import homeAppModel from 'services/models/home/homeAppModel';

import Home from './Home';

function HomeContainer(): React.FunctionComponentElement<React.ReactNode> {
  const homeData = useModel(homeAppModel);

  React.useEffect(() => {
    homeAppModel.initialize();
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
        onNotificationDelete={homeAppModel.onHomeNotificationDelete}
      />
    </ErrorBoundary>
  );
}
export default HomeContainer;
