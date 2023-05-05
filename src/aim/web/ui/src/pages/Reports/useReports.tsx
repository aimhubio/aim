import React from 'react';
import { useModel } from 'hooks';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';
import reportsAppModel from 'services/models/reports/reportsAppModel';

function useReports() {
  const reportsData = useModel(reportsAppModel);

  React.useEffect(() => {
    reportsAppModel.initialize();
    analytics.pageView(ANALYTICS_EVENT_KEYS.reports.pageView);
    return () => {
      reportsAppModel.destroy();
    };
  }, []);

  const [searchValue, setSearchValue] = React.useState<string>('');

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { value } = e.target;
    setSearchValue(value);
  }

  const filteredReports = React.useMemo(() => {
    if (!searchValue) {
      return reportsData?.listData;
    }

    return reportsData?.listData?.filter((report: any) => {
      return report.name.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [reportsData?.listData, searchValue]);

  return {
    searchValue,
    handleSearchChange,
    reports: reportsData?.listData!,
    filteredReports,
    isLoading: reportsData?.isLoading!,
    notifyData: reportsData?.notifyData,
    onReportDelete: reportsAppModel.onReportDelete,
    onNotificationDelete: reportsAppModel.onReportsNotificationDelete,
  };
}

export default useReports;
