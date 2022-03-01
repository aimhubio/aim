import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

// import usePanelResize from 'hooks/resize/usePanelResize';

// import ResizePanel from "components/ResizePanel/ResizePanel";
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import TableLoader from 'components/TableLoader/TableLoader';
import Table from 'components/Table/Table';

import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import useModel from 'hooks/model/useModel';

import SelectForm from 'pages/TextExplorer/components/SelectForm/SelectForm';

import textExplorerAppModel from 'services/models/textExplorer/textExplorerAppModel';

import { IApiRequest } from 'types/services/services';
import { ITextExplorerAppModelState } from 'types/services/models/textExplorer/texteExplorerAppModel';

import exceptionHandler from 'utils/app/exceptionHandler';
import getStateFromUrl from 'utils/getStateFromUrl';

import './TextExplorer.scss';
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

function TextExplorer() {
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const textsWrapperRef = React.useRef<any>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const route = useRouteMatch<any>();
  const history = useHistory();
  const textsData =
    useModel<Partial<ITextExplorerAppModelState>>(textExplorerAppModel);

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
      if (!!textsData?.config) {
        if (
          // metricsData.config.grouping !== getStateFromUrl('grouping') ||
          // metricsData.config.chart !== getStateFromUrl('chart') ||
          textsData.config.select !== getStateFromUrl('select')
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
            App bar
            <div className='TextExplorer__SelectForm__Grouping__container'>
              <SelectForm
                requestIsPending={
                  textsData?.requestStatus === RequestStatusEnum.Pending
                }
                selectedTextsData={textsData?.config?.select!}
                selectFormData={textsData?.selectFormData!}
                onTextsExplorerSelectChange={
                  textExplorerAppModel.onTextsExplorerSelectChange
                }
                searchButtonDisabled={textsData?.searchButtonDisabled!}
                onSelectRunQueryChange={
                  textExplorerAppModel.onSelectRunQueryChange
                }
                // onSelectAdvancedQueryChange={
                //   textExplorerAppModel.onSelectAdvancedQueryChange
                // }
                // toggleSelectAdvancedMode={
                //   textExplorerAppModel.toggleSelectAdvancedMode
                // }
                // onSearchQueryCopy={textExplorerAppModel.onSearchQueryCopy}
              />
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
