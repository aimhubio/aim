import React from 'react';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import useReportsStore from './ReportsStore';

function useReports() {
  const reportsList = useReportsStore((state) => state.listData);
  const isLoading = useReportsStore((state) => state.isLoading);
  const notifyData = useReportsStore((state) => state.notifyData);
  const getReportsData = useReportsStore((state) => state.getReportsData);
  const onReportDelete = useReportsStore((state) => state.onReportDelete);

  React.useEffect(() => {
    if (reportsList?.length === 0) {
      getReportsData();
    }
    analytics.pageView(ANALYTICS_EVENT_KEYS.reports.pageView);
  }, []);

  const [searchValue, setSearchValue] = React.useState<string>('');

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { value } = e.target;
    setSearchValue(value);
  }

  const filteredReports = React.useMemo(() => {
    if (!searchValue) {
      return reportsList;
    }

    return reportsList?.filter((report: any) => {
      return report.name.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [reportsList, searchValue]);

  return {
    searchValue,
    handleSearchChange,
    reports: reportsList,
    isLoading,
    notifyData,
    filteredReports,
    onReportDelete,
  };
}

export default useReports;
