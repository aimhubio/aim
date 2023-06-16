import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { PathEnum } from 'config/enums/routesEnum';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import useReportsStore from 'pages/Reports/ReportsStore';

import * as analytics from 'services/analytics';

import { setDocumentTitle } from 'utils/document/documentTitle';

import Report from './Report';

function ReportContainer(): React.FunctionComponentElement<React.ReactNode> {
  const reportData = useReportsStore((state) => state.report);
  const isLoading = useReportsStore((state) => state.isLoading);
  const getReportData = useReportsStore((state) => state.getReportData);
  const createReport = useReportsStore((state) => state.onReportCreate);
  const updateReport = useReportsStore((state) => state.onReportUpdate);
  const { params, path } = useRouteMatch<any>();
  const history = useHistory();

  React.useEffect(() => {
    if (params.reportId === 'new') {
      useReportsStore.setState({ isLoading: false });
    } else {
      getReportData(params.reportId);
    }
    analytics.pageView(ANALYTICS_EVENT_KEYS.report.pageView);
    return () => {
      // reportAppModel.destroy();
    };
  }, [params.reportId]);

  React.useEffect(() => {
    setDocumentTitle(reportData?.name, true);
  }, [reportData?.name]);

  const saveReport = React.useCallback(
    async (data: any) => {
      if (params.reportId === 'new') {
        const newReport = await createReport({
          name: data.name,
          description: data.description,
          code: data.code,
        });
        if (newReport?.id) {
          const url = PathEnum.Report_Edit.replace(':reportId', newReport.id);
          history.push(url);
        }
      } else {
        await updateReport(params.reportId, {
          ...reportData,
          ...data,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.reportId, reportData],
  );

  return (
    <ErrorBoundary>
      {!isLoading && (
        <Report
          data={reportData}
          isLoading={isLoading!}
          editMode={path === PathEnum.Report_Edit}
          newMode={params.reportId === 'new'}
          saveReport={saveReport}
        />
      )}
    </ErrorBoundary>
  );
}

export default ReportContainer;
