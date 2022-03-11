import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import _ from 'lodash-es';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import TableLoader from 'components/TableLoader/TableLoader';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ResizePanel from 'components/ResizePanel/ResizePanel';
import Table from 'components/Table/Table';

import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import { RowHeightSize } from 'config/table/tableConfigs';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { ResizeModeEnum } from 'config/enums/tableEnums';

import useModel from 'hooks/model/useModel';
import usePanelResize from 'hooks/resize/usePanelResize';

import SelectForm from 'pages/TextExplorer/components/SelectForm/SelectForm';
import RangePanel from 'pages/RunDetail/TraceVisualizationContainer/RangePanel';

import * as analytics from 'services/analytics';
import { AppNameEnum } from 'services/models/explorer';
import textExplorerAppModel from 'services/models/textExplorer/textExplorerAppModel';

import { IApiRequest } from 'types/services/services';

import exceptionHandler from 'utils/app/exceptionHandler';
import getStateFromUrl from 'utils/getStateFromUrl';

import TextExplorerAppBar from './components/TextExplorerAppBar/TextExplorerAppBar';
import useTextSearch from './components/SearchBar/useTextSearch';
import SearchBar from './components/SearchBar';

import './TextExplorer.scss';

function TextExplorer() {
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const textsWrapperRef = React.useRef<any>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const route = useRouteMatch<any>();
  const history = useHistory();
  const textExplorerData = useModel<Partial<any>>(textExplorerAppModel);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);
  const textsTableElementRef = React.useRef<any>(null);

  const panelResizing = usePanelResize(
    wrapperElemRef,
    textsWrapperRef,
    tableElemRef,
    resizeElemRef,
    textExplorerData?.config?.table || {},
    textExplorerAppModel.onTableResizeEnd,
  );

  function handleSearch() {
    analytics.trackEvent(ANALYTICS_EVENT_KEYS.texts.textPanel.clickApplyButton);
    textsTableElementRef.current = textExplorerAppModel.getTextData(true);
    textsTableElementRef.current.call();
  }

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

  const textSearch = useTextSearch({
    rawData: textExplorerData?.data ? textExplorerData?.data[0].data : [],
    updateData: textExplorerAppModel?.highlightTextTableRows,
    searchKey: 'data',
  });

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
              className={`TextExplorer__textsWrapper__container ${
                _.isEmpty(textExplorerData?.tableData) &&
                textExplorerData?.requestStatus !== RequestStatusEnum.Pending
                  ? 'TextExplorer__textsWrapper__container__fullHeight'
                  : textExplorerData?.config?.table.resizeMode ===
                    ResizeModeEnum.MaxHeight
                  ? 'TextExplorer__textsWrapper__container__hide'
                  : ''
              }`}
            >
              <SearchBar
                isValidInput={textSearch.filterOptions.isValidSearch}
                searchValue={textSearch.filterOptions.searchValue}
                matchType={textSearch.filterOptions.matchType}
                onMatchTypeChange={textSearch.changeMatchType}
                onInputClear={textSearch.clearSearchInputData}
                onInputChange={textSearch.changeSearchInput}
                isDisabled={!!textExplorerData?.isRequestPending}
              />
              <Table
                custom
                topHeader
                ref={textExplorerData?.refs?.textTableRef}
                fixed={false}
                columns={textExplorerData?.tablePanelColumns || []}
                data={textExplorerData?.tablePanelData || []}
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
                columnsOrder={
                  textExplorerData?.tablePanel?.config?.columnsOrder
                }
                //methods
                onManageColumns={
                  textExplorerAppModel.onTablePanelColumnsOrderChange
                }
              />
            </div>
            <div>
              {textExplorerData?.config?.texts?.stepRange &&
                textExplorerData?.config?.texts?.indexRange &&
                textExplorerData?.config?.table.resizeMode !==
                  ResizeModeEnum.MaxHeight &&
                textExplorerAppModel.showRangePanel() &&
                !_.isEmpty(textExplorerData?.textsData) && (
                  <RangePanel
                    onApply={handleSearch}
                    applyButtonDisabled={textExplorerData?.applyButtonDisabled}
                    onInputChange={textExplorerAppModel.onDensityChange}
                    onRangeSliderChange={
                      textExplorerAppModel.onSliceRangeChange
                    }
                    items={[
                      {
                        inputName: 'recordDensity',
                        inputTitle: 'Steps count',
                        inputTitleTooltip: 'Number of steps to display',
                        inputValue:
                          textExplorerData?.config?.texts?.recordDensity,
                        // key: 'record_range',
                        rangeEndpoints:
                          textExplorerData?.config?.texts?.stepRange,
                        selectedRangeValue:
                          textExplorerData?.config?.texts?.recordSlice,
                        sliderName: 'recordSlice',
                        sliderTitle: 'Steps',
                        sliderTitleTooltip:
                          'Training step. Increments every time track() is called',
                        sliderType: 'range',
                      },
                      {
                        inputName: 'indexDensity',
                        inputTitle: 'Indices count',
                        inputTitleTooltip: 'Number of texts per step',
                        inputValidationPatterns: undefined,
                        inputValue:
                          textExplorerData?.config?.texts?.indexDensity,
                        // key: 'index_range',
                        rangeEndpoints:
                          textExplorerData?.config?.texts?.indexRange,
                        selectedRangeValue:
                          textExplorerData?.config?.texts?.indexSlice,
                        sliderName: 'indexSlice',
                        sliderTitle: 'Indices',
                        sliderTitleTooltip:
                          'Index in the list of texts passed to track() call',
                        sliderType: 'range',
                      },
                    ]}
                  />
                )}
            </div>
            <ResizePanel
              className={`TextExplorer__ResizePanel${
                _.isEmpty(textExplorerData?.tableData) &&
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
            <div
              ref={tableElemRef}
              className={`TextExplorer__table__container${
                textExplorerData?.requestStatus !== RequestStatusEnum.Pending &&
                (textExplorerData?.config?.table.resizeMode ===
                  ResizeModeEnum.Hide ||
                  _.isEmpty(textExplorerData?.tableData!))
                  ? '__hide'
                  : ''
              }`}
            >
              <BusyLoaderWrapper
                isLoading={
                  textExplorerData?.requestStatus === RequestStatusEnum.Pending
                }
                className='TextExplorer__loader'
                height='100%'
                loaderComponent={<TableLoader />}
              >
                {!_.isEmpty(textExplorerData?.tableData) ? (
                  <ErrorBoundary>
                    <Table
                      // deletable
                      custom
                      ref={textExplorerData?.refs?.tableRef}
                      data={textExplorerData?.tableData || []}
                      columns={textExplorerData?.tableColumns || []}
                      // // Table options
                      topHeader
                      groups={!Array.isArray(textExplorerData?.tableData)}
                      rowHeight={textExplorerData?.config?.table.rowHeight}
                      rowHeightMode={
                        textExplorerData?.config?.table.rowHeight ===
                        RowHeightSize.sm
                          ? 'small'
                          : textExplorerData?.config?.table.rowHeight ===
                            RowHeightSize.md
                          ? 'medium'
                          : 'large'
                      }
                      selectedRows={textExplorerData?.selectedRows}
                      sortOptions={textExplorerData?.groupingSelectOptions}
                      sortFields={textExplorerData?.config?.table.sortFields}
                      hiddenRows={textExplorerData?.config?.table.hiddenMetrics}
                      hiddenColumns={
                        textExplorerData?.config?.table.hiddenColumns
                      }
                      resizeMode={textExplorerData?.config?.table.resizeMode}
                      columnsWidths={
                        textExplorerData?.config?.table.columnsWidths
                      }
                      appName={AppNameEnum.TEXTS}
                      // hiddenChartRows={textsData?.textData?.length === 0}
                      columnsOrder={
                        textExplorerData?.config?.table.columnsOrder
                      }
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
                      onRowsChange={textExplorerAppModel.onTextVisibilityChange}
                      onTableResizeModeChange={
                        textExplorerAppModel.onTableResizeModeChange
                      }
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
