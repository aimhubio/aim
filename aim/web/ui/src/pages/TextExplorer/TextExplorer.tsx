import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import TableLoader from 'components/TableLoader/TableLoader';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ResizePanel from 'components/ResizePanel/ResizePanel';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import useModel from 'hooks/model/useModel';
import usePanelResize from 'hooks/resize/usePanelResize';

import SelectForm from 'pages/TextExplorer/components/SelectForm/SelectForm';

import textExplorerAppModel from 'services/models/textExplorer/textExplorerAppModel';

import { IApiRequest } from 'types/services/services';

import exceptionHandler from 'utils/app/exceptionHandler';
import getStateFromUrl from 'utils/getStateFromUrl';

import TextExplorerAppBar from './components/TextExplorerAppBar/TextExplorerAppBar';

import './TextExplorer.scss';

function TextExplorer() {
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const textsWrapperRef = React.useRef<any>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const route = useRouteMatch<any>();
  const history = useHistory();
  const textExplorerData = useModel<Partial<any>>(textExplorerAppModel);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);

  const panelResizing = usePanelResize(
    wrapperElemRef,
    textsWrapperRef,
    tableElemRef,
    resizeElemRef,
    textExplorerData?.config?.table || {},
    textExplorerAppModel.onTableResizeEnd,
  );

  React.useEffect(() => {
    textExplorerAppModel.initialize(route.params.appId);
    let appRequestRef: IApiRequest<void>;
    let textRequestRef: IApiRequest<void>;
    if (route.params.appId) {
      appRequestRef = textExplorerAppModel.getAppConfigData(route.params.appId);
      appRequestRef
        .call((detail: any) => {
          exceptionHandler({ detail, model: textExplorerAppModel });
        })
        .then(() => {
          textRequestRef = textExplorerAppModel.getTextData();
          textRequestRef.call((detail: any) => {
            exceptionHandler({ detail, model: textExplorerAppModel });
          });
        });
    } else {
      textExplorerAppModel.setDefaultAppConfigData();
      textRequestRef = textExplorerAppModel.getTextData();
      textRequestRef.call((detail: any) => {
        exceptionHandler({ detail, model: textExplorerAppModel });
      });
    }
    // analytics.pageView(ANALYTICS_EVENT_KEYS.images.pageView);

    const unListenHistory = history.listen(() => {
      if (!!textExplorerData?.config) {
        if (
          // metricsData.config.grouping !== getStateFromUrl('grouping') ||
          // metricsData.config.chart !== getStateFromUrl('chart') ||
          textExplorerData.config.select !== getStateFromUrl('select')
        ) {
          textExplorerAppModel.setDefaultAppConfigData();
          textExplorerAppModel.updateModelData();
        }
      }
    });
    return () => {
      textExplorerAppModel.destroy();
      textRequestRef?.abort();
      unListenHistory();
      if (appRequestRef) {
        appRequestRef.abort();
      }
    };
  }, [route.params.appId]);

  return (
    <ErrorBoundary>
      <div className='TextExplorer__container' ref={wrapperElemRef}>
        <section className='TextExplorer__section'>
          <div className='TextExplorer__section__div TextExplorer__fullHeight'>
            <TextExplorerAppBar
              onBookmarkCreate={textExplorerAppModel.onBookmarkCreate}
              onBookmarkUpdate={textExplorerAppModel.onBookmarkUpdate}
              title='Text explorer'
            />
            <div className='TextExplorer__SelectForm__Grouping__container'>
              <SelectForm
                requestIsPending={
                  textExplorerData?.requestStatus === RequestStatusEnum.Pending
                }
                selectedTextsData={textExplorerData?.config?.select!}
                selectFormData={textExplorerData?.selectFormData!}
                onTextsExplorerSelectChange={
                  textExplorerAppModel.onTextsExplorerSelectChange
                }
                searchButtonDisabled={textExplorerData?.searchButtonDisabled!}
                onSelectRunQueryChange={
                  textExplorerAppModel.onSelectRunQueryChange
                }
                onSelectAdvancedQueryChange={
                  textExplorerAppModel.onSelectAdvancedQueryChange
                }
                toggleSelectAdvancedMode={
                  textExplorerAppModel.toggleSelectAdvancedMode
                }
                onSearchQueryCopy={textExplorerAppModel.onSearchQueryCopy}
              />
            </div>
            <div
              ref={textsWrapperRef}
              className='TextExplorer__textsWrapper__container'
            >
              Texts Panel
            </div>
            <ResizePanel
              className={`ImagesExplore__ResizePanel${
                _.isEmpty(textExplorerData?.textsData) &&
                textExplorerData?.requestStatus !== RequestStatusEnum.Pending
                  ? '__hide'
                  : ''
              }`}
              panelResizing={panelResizing}
              resizeElemRef={resizeElemRef}
              resizeMode={textExplorerData?.config?.table.resizeMode}
              onTableResizeModeChange={
                textExplorerAppModel.onTableResizeModeChange
              }
            />
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
        {textExplorerData?.notifyData?.length > 0 && (
          <NotificationContainer
            handleClose={textExplorerAppModel.onNotificationDelete}
            data={textExplorerData?.notifyData}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default TextExplorer;
