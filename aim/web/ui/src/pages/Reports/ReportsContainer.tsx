import React from 'react';
import { useModel } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import reportsAppModel from 'services/models/reports/reportsAppModel';
import * as analytics from 'services/analytics';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import Reports from './Reports';

function ReportsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const reportsData = useModel(reportsAppModel);

  React.useEffect(() => {
    reportsAppModel.initialize();
    analytics.pageView(ANALYTICS_EVENT_KEYS.reports.pageView);
    return () => {
      reportsAppModel.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Reports
        data={reportsData?.listData!}
        isLoading={reportsData?.isLoading!}
        notifyData={reportsData?.notifyData as INotification[]}
        onBoardDelete={reportsAppModel.onReportDelete}
        onNotificationDelete={reportsAppModel.onReportsNotificationDelete}
      />
    </ErrorBoundary>
  );
}

export default ReportsContainer;
