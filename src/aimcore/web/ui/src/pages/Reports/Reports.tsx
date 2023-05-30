import React from 'react';

import { IconPlus } from '@tabler/icons-react';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import { Box, Button, Input, Link, Text } from 'components/kit_v2';
import Illustration, { ILLUSTRATION_TYPES } from 'components/Illustration';

import { PathEnum } from 'config/enums/routesEnum';
import { TopBar } from 'config/stitches/foundations/layout';

import useReports from './useReports';
import {
  ReportsContainer,
  ReportsListContainer,
  ReportsNoResultsContainer,
} from './Reports.style';
import ReportCard from './ReportCard/ReportCard';

function Reports(): React.FunctionComponentElement<React.ReactNode> {
  const {
    reports,
    isLoading,
    notifyData,
    searchValue,
    filteredReports,
    onReportDelete,
    handleSearchChange,
    onNotificationDelete,
  } = useReports();

  return (
    <ErrorBoundary>
      <TopBar>
        <Text weight='$3'>Reports</Text>
      </TopBar>
      <ReportsContainer>
        <BusyLoaderWrapper isLoading={isLoading} height='100%'>
          {reports?.length > 0 ? (
            <>
              <Box display='flex' ai='center'>
                <Box flex={1}>
                  <Input
                    inputSize='lg'
                    value={searchValue}
                    onChange={handleSearchChange}
                    css={{ width: 380 }}
                    placeholder='Search'
                  />
                </Box>
                <Link
                  underline={false}
                  to={PathEnum.Report.replace(':reportId', 'new')}
                >
                  <Button
                    size='lg'
                    leftIcon={<IconPlus color='white' />}
                    color='success'
                  >
                    New
                  </Button>
                </Link>
              </Box>
              <ReportsListContainer>
                {filteredReports?.length > 0 ? (
                  filteredReports.map((report: any) => (
                    <ReportCard
                      key={report.id}
                      onReportDelete={onReportDelete}
                      {...report}
                    />
                  ))
                ) : (
                  <>
                    <ReportsNoResultsContainer>
                      <Text css={{ textAlign: 'center' }} size='$4'>
                        No search results
                      </Text>
                    </ReportsNoResultsContainer>
                    {reports.map((report: any) => (
                      <ReportCard
                        key={report.id}
                        onReportDelete={onReportDelete}
                        {...report}
                      />
                    ))}
                  </>
                )}
              </ReportsListContainer>
            </>
          ) : (
            <Illustration type={ILLUSTRATION_TYPES.Empty_Reports}>
              <Box mt='$8' display='flex' ai='center' jc='center'>
                <Link
                  underline={false}
                  to={PathEnum.Report.replace(':reportId', 'new')}
                >
                  <Button
                    size='lg'
                    leftIcon={<IconPlus color='white' />}
                    color='success'
                  >
                    Create New Report
                  </Button>
                </Link>
              </Box>
            </Illustration>
          )}
        </BusyLoaderWrapper>
      </ReportsContainer>
      {notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={onNotificationDelete}
          data={notifyData}
        />
      )}
    </ErrorBoundary>
  );
}

export default Reports;
