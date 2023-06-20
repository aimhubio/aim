import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { PathEnum } from 'config/enums/routesEnum';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import useReportsStore from 'pages/Reports/ReportsStore';

import * as analytics from 'services/analytics';
import usePyodide from 'services/pyodide/usePyodide';

import { setDocumentTitle } from 'utils/document/documentTitle';

function useReport() {
  const { isLoading: pyodideIsLoading } = usePyodide();
  const reportData = useReportsStore((state) => state.report);
  const reportsList = useReportsStore((state) => state.listData);
  const isLoading = useReportsStore((state) => state.isLoading);
  const getReportData = useReportsStore((state) => state.getReportData);
  const createReport = useReportsStore((state) => state.onReportCreate);
  const updateReport = useReportsStore((state) => state.onReportUpdate);
  const editorValue = useReportsStore((state) => state.editorValue);
  const setEditorValue = useReportsStore((state) => state.setEditorValue);
  const { params, path } = useRouteMatch<any>();
  const history = useHistory();

  React.useEffect(() => {
    if (params.reportId === 'new') {
      useReportsStore.setState({ isLoading: false });
    } else {
      const foundReport = reportsList?.find(
        (report: any) => report?.id === params.reportId,
      );
      if (foundReport?.id) {
        useReportsStore.setState({
          isLoading: false,
          report: foundReport,
          editorValue: foundReport.code,
        });
      } else {
        getReportData(params.reportId);
      }
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

  React.useEffect(() => {
    return () => {
      useReportsStore.setState({
        editorValue: '',
        report: {
          name: 'New Report',
          description: '',
          code: '',
        },
      });
    };
  }, []);

  return {
    reportId: params.reportId,
    data: reportData,
    isLoading,
    pyodideIsLoading,
    editMode: path === PathEnum.Report_Edit,
    newMode: params.reportId === 'new',
    editorValue,
    setEditorValue,
    saveReport,
  };
}

export default useReport;
