import React from 'react';

// import usePanelResize from 'hooks/resize/usePanelResize';

// import ResizePanel from "components/ResizePanel/ResizePanel";
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import TableLoader from 'components/TableLoader/TableLoader';
import Table from 'components/Table/Table';

import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

import './TextExplorer.scss';

function TextExplorer() {
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const textsWrapperRef = React.useRef<any>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);

  const tableColumns = [
    {
      dataKey: 'step',
      key: 'step',
      title: 'Step',
      width: 100,
    },
    {
      dataKey: 'index',
      key: 'index',
      title: 'Index',
      width: 100,
    },
    {
      dataKey: 'text',
      key: 'text',
      title: 'Text',
      width: 0,
      flexGrow: 1,
      // TODO: replace with a wrapper component for all types of texts visualization
      cellRenderer: function cellRenderer({ cellData }: any) {
        return <p>{cellData}</p>;
      },
    },
  ];
  return (
    <ErrorBoundary>
      <div className='TextExplorer__container' ref={wrapperElemRef}>
        <section className='TextExplorer__section'>
          <div className='TextExplorer__section__div TextExplorer__fullHeight'>
            App bar
            <div className='TextsExplorer__SelectForm__Grouping__container'>
              Search bar
            </div>
            <div
              ref={textsWrapperRef}
              className='TextExplorer__textsWrapper__container'
            >
              <Table
                custom
                ref={tableElemRef}
                fixed={false}
                columns={tableColumns}
                data={[]}
                isLoading={false}
                hideHeaderActions
                estimatedRowHeight={32}
                headerHeight={32}
                updateColumnsWidths={() => {}}
                illustrationConfig={{
                  page: 'runs',
                  title: 'No Tracked Texts',
                  type: IllustrationsEnum.EmptyData,
                }}
                height='100%'
              />
            </div>
            Resize panel
            <div ref={tableElemRef} className='TextExplorer__table__container'>
              <BusyLoaderWrapper
                isLoading={false}
                className='TextExplore__loader'
                height='100%'
                loaderComponent={<TableLoader />}
              >
                Table
              </BusyLoaderWrapper>
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}

export default TextExplorer;
