import React from 'react';

// import usePanelResize from 'hooks/resize/usePanelResize';

// import ResizePanel from "components/ResizePanel/ResizePanel";
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import TableLoader from 'components/TableLoader/TableLoader';

import './TextExplorer.scss';

function TextExplorer() {
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const textsWrapperRef = React.useRef<any>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
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
              Texts Panel
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
