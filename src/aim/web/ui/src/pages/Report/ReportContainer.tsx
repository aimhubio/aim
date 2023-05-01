import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useModel } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { PathEnum } from 'config/enums/routesEnum';

import reportAppModel from 'services/models/report/reportAppModel';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import { setDocumentTitle } from 'utils/document/documentTitle';

import Report from './Report';

function ReportContainer(): React.FunctionComponentElement<React.ReactNode> {
  const reportData = useModel(reportAppModel);
  const { params, path } = useRouteMatch<any>();

  React.useEffect(() => {
    reportAppModel.initialize(params.reportId);
    // TODO: add analytics for Report page
    // analytics.pageView(ANALYTICS_EVENT_KEYS.report.pageView);
    return () => {
      // reportAppModel.destroy();
    };
  }, [params.reportId]);

  React.useEffect(() => {
    setDocumentTitle(reportData.report.name, true);
  }, [reportData.report.name]);

  const saveReport = React.useCallback(
    async (data: any) => {
      if (params.reportId === 'new') {
        await reportAppModel.createReport(
          data.name,
          data.description,
          data.code,
        );
      } else {
        await reportAppModel.updateReport(params.reportId, {
          ...reportData.report,
          ...data,
        });
      }
    },
    [params.reportId, reportAppModel, reportData.report],
  );

  return (
    <ErrorBoundary>
      {!reportData?.isLoading && (
        <Report
          data={reportData?.report!}
          isLoading={reportData?.isLoading!}
          editMode={path === PathEnum.Report_Edit}
          newMode={params.reportId === 'new'}
          notifyData={reportData?.notifyData as INotification[]}
          saveReport={saveReport}
          onNotificationDelete={reportAppModel.onReportNotificationDelete}
        />
      )}
    </ErrorBoundary>
  );
}

export default ReportContainer;
