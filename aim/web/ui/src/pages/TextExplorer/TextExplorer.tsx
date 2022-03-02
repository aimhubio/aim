import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import _ from 'lodash';

import Table from 'components/Table/Table';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import TableLoader from 'components/TableLoader/TableLoader';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import { RowHeightSize } from 'config/table/tableConfigs';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { ResizeModeEnum } from 'config/enums/tableEnums';

import useModel from 'hooks/model/useModel';

import SelectForm from 'pages/TextExplorer/components/SelectForm/SelectForm';

import * as analytics from 'services/analytics';
import { AppNameEnum } from 'services/models/explorer';
import textExplorerAppModel from 'services/models/textExplorer/textExplorerAppModel';

import { IApiRequest } from 'types/services/services';
import { ITextExplorerAppModelState } from 'types/services/models/textExplorer/texteExplorerAppModel';

import exceptionHandler from 'utils/app/exceptionHandler';
import getStateFromUrl from 'utils/getStateFromUrl';

import './TextExplorer.scss';

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
    analytics.pageView(ANALYTICS_EVENT_KEYS.texts.pageView);
    const unListenHistory = history.listen(() => {
      if (!!textsData?.config) {
        if (textsData.config.select !== getStateFromUrl('select')) {
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
              Texts Panel
            </div>
            Resize panel
            <div
              ref={tableElemRef}
              className={`TextExplorer__table__container${
                textsData?.requestStatus !== RequestStatusEnum.Pending &&
                (textsData?.config?.table.resizeMode === ResizeModeEnum.Hide ||
                  _.isEmpty(textsData?.tableData!))
                  ? '__hide'
                  : ''
              }`}
            >
              <BusyLoaderWrapper
                isLoading={
                  textsData?.requestStatus === RequestStatusEnum.Pending
                }
                className='ImagesExplore__loader'
                height='100%'
                loaderComponent={<TableLoader />}
              >
                {!_.isEmpty(textsData?.tableData) ? (
                  <ErrorBoundary>
                    <Table
                      // deletable
                      custom
                      ref={textsData?.refs?.tableRef}
                      data={textsData?.tableData || []}
                      columns={textsData?.tableColumns || []}
                      // // Table options
                      topHeader
                      groups={!Array.isArray(textsData?.tableData)}
                      rowHeight={textsData?.config?.table.rowHeight}
                      rowHeightMode={
                        textsData?.config?.table.rowHeight === RowHeightSize.sm
                          ? 'small'
                          : textsData?.config?.table.rowHeight ===
                            RowHeightSize.md
                          ? 'medium'
                          : 'large'
                      }
                      // focusedState={
                      //   imagesExploreData?.config?.images?.focusedState!
                      // }
                      selectedRows={textsData?.selectedRows}
                      sortOptions={textsData?.groupingSelectOptions}
                      sortFields={textsData?.config?.table.sortFields}
                      hiddenRows={textsData?.config?.table.hiddenMetrics}
                      hiddenColumns={textsData?.config?.table.hiddenColumns}
                      // resizeMode={imagesExploreData?.config?.table.resizeMode}
                      columnsWidths={textsData?.config?.table.columnsWidths}
                      appName={AppNameEnum.TEXTS}
                      // hiddenChartRows={textsData?.textData?.length === 0}
                      columnsOrder={textsData?.config?.table.columnsOrder}
                      // // Table actions
                      onSort={textExplorerAppModel.onTableSortChange}
                      onSortReset={textExplorerAppModel.onSortReset}
                      onExport={textExplorerAppModel.onExportTableData}
                      onManageColumns={
                        textExplorerAppModel.onColumnsOrderChange
                      }
                      onColumnsVisibilityChange={
                        textExplorerAppModel.onColumnsVisibilityChange
                      }
                      onTableDiffShow={textExplorerAppModel.onTableDiffShow}
                      onRowHeightChange={textExplorerAppModel.onRowHeightChange}
                      //@TODO add hide sequence functionality
                      // onRowsChange={textExplorerAppModel.onTextVisibilityChange}
                      // onRowHover={imagesExploreAppModel.onTableRowHover}
                      // onRowClick={imagesExploreAppModel.onTableRowClick}
                      // onTableResizeModeChange={
                      //   imagesExploreAppModel.onTableResizeModeChange
                      // }
                      updateColumnsWidths={
                        textExplorerAppModel.updateColumnsWidths
                      }
                      onRowSelect={textExplorerAppModel.onRowSelect}
                      archiveRuns={textExplorerAppModel.archiveRuns}
                      deleteRuns={textExplorerAppModel.deleteRuns}
                      multiSelect
                    />
                  </ErrorBoundary>
                ) : null}
              </BusyLoaderWrapper>
            </div>
          </div>
        </section>
        {textsData?.notifyData && textsData?.notifyData?.length > 0 && (
          <NotificationContainer
            handleClose={textExplorerAppModel.onNotificationDelete}
            data={textsData?.notifyData}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default TextExplorer;
