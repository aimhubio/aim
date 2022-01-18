import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import useModel from 'hooks/model/useModel';

import homeAppModel from 'services/models/home/homeAppModel';

import Home from './Home';

function HomeContainer(): React.FunctionComponentElement<React.ReactNode> {
  const activityRequestRef = React.useRef(homeAppModel.getActivityData());
  const homeData = useModel(homeAppModel);

  React.useEffect(() => {
    homeAppModel.initialize();
    activityRequestRef.current.call();
    return () => {
      activityRequestRef.current.abort();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Home
        onSendEmail={homeAppModel.onSendEmail}
        activityData={homeData.activityData}
        notifyData={homeData.notifyData}
        askEmailSent={homeData.askEmailSent}
        onNotificationDelete={homeAppModel.onNotificationDelete}
      />
    </ErrorBoundary>
  );
}
export default HomeContainer;
