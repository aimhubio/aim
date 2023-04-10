import React from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { Link } from '@material-ui/core';

import { Button, Text } from 'components/kit';
import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import Illustration from 'components/Illustration';

import pageTitlesEnum from 'config/pageTitles/pageTitles';
import { PathEnum } from 'config/enums/routesEnum';

import ReportDelete from './ReportDelete';

import './Reports.scss';

function Reports({
  data,
  onReportDelete,
  isLoading,
  notifyData,
  onNotificationDelete,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <section className='Reports'>
        <AppBar title={pageTitlesEnum.REPORTS} className='Reports__appBar' />
        <div className='Reports__list'>
          <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
            <div
              key='new'
              className='Reports__list__item Reports__list__item--new'
            >
              <div className='Reports__list__item__header'>
                <Text size={16} weight={700}>
                  New report
                </Text>
                <Link
                  to={PathEnum.Report.replace(':reportId', 'new')}
                  component={RouteLink}
                  underline='none'
                >
                  <Button variant='outlined' size='small'>
                    Create
                  </Button>
                </Link>
              </div>
              <div className='Reports__list__item__sub'>
                <Text>Create custom report</Text>
              </div>
              <div className='Reports__list__item__preview'>
                <Illustration />
              </div>
            </div>
            {data?.length > 0 &&
              data.map((report: any) => (
                <div key={report.id} className='Reports__list__item'>
                  <div className='Reports__list__item__header'>
                    <Text size={16} weight={700}>
                      {report.name}
                    </Text>
                    <div>
                      <Link
                        to={PathEnum.Report.replace(':reportId', report.id)}
                        component={RouteLink}
                        underline='none'
                      >
                        <Button variant='outlined' size='small'>
                          View
                        </Button>
                      </Link>
                      <ReportDelete
                        report_id={report.id}
                        onReportDelete={onReportDelete}
                      />
                    </div>
                  </div>
                  <div className='Reports__list__item__sub'>
                    <Text>{report.description}</Text>
                  </div>
                  <div className='Reports__list__item__preview'>
                    <CodeBlock code={report.code} hideCopyIcon />
                  </div>
                </div>
              ))}
          </BusyLoaderWrapper>
        </div>
      </section>
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
