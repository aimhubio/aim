import React from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';
import imagesExploreAppModel from 'services/models/imagesExplore/imagesExploreAppModel';
import * as analytics from 'services/analytics';
import useModel from 'hooks/model/useModel';
import Grouping from 'pages/Metrics/components/Grouping/Grouping';
import ImagesExploreAppBar from './components/ImagesExploreAppBar/ImagesExploreAppBar';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import getStateFromUrl from 'utils/getStateFromUrl';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { isEmpty } from 'lodash-es';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import TableLoader from 'components/TableLoader/TableLoader';
import { RowHeightSize } from 'config/table/tableConfigs';
import Table from 'components/Table/Table';
import ResizePanel from 'components/ResizePanel/ResizePanel';
import usePanelResize from 'hooks/resize/usePanelResize';
import SelectForm from 'pages/ImagesExplore/components/SelectForm/SelectForm';
import ImagesPanel from 'components/ImagesPanel';

import './ImagesExplore.scss';

function ImagesExplore(): React.FunctionComponentElement<React.ReactNode> {
  const route = useRouteMatch<any>();
  const location = useLocation();
  const imagesExploreData = useModel<Partial<any>>(imagesExploreAppModel);
  const imagesWrapperRef = React.useRef<any>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);

  const panelResizing = usePanelResize(
    wrapperElemRef,
    imagesWrapperRef,
    tableElemRef,
    resizeElemRef,
    imagesExploreData?.config?.table || {},
    imagesExploreAppModel.onTableResizeEnd,
  );

  React.useEffect(() => {
    imagesExploreAppModel.initialize(route.params.appId);
    let appRequestRef: {
      call: () => Promise<void>;
      abort: () => void;
    };
    if (route.params.appId) {
      appRequestRef = imagesExploreAppModel.getAppConfigData(
        route.params.appId,
      );
      appRequestRef.call().then(() => {
        imagesExploreAppModel.getImagesData().call();
        imagesExploreAppModel.setDefaultAppConfigData();
      });
    } else {
      imagesExploreAppModel.setDefaultAppConfigData();
    }

    const metricsRequestRef = imagesExploreAppModel.getImagesData();
    metricsRequestRef.call();
    analytics.pageView('[ImagesExplorer]');
    return () => {
      metricsRequestRef.abort();
      if (appRequestRef) {
        appRequestRef.abort();
      }
    };
  }, []);

  // Add effect to recover state from URL when browser history navigation is used
  React.useEffect(() => {
    if (!!imagesExploreData?.config) {
      if (
        imagesExploreData.config.grouping !== getStateFromUrl('grouping') ||
        imagesExploreData.config.chart !== getStateFromUrl('chart') ||
        imagesExploreData.config.select !== getStateFromUrl('select')
      ) {
        imagesExploreAppModel.setDefaultAppConfigData();
        imagesExploreAppModel.updateModelData();
      }
    }
  }, [location.search]);
  console.log(imagesExploreData);

  return (
    <div className='ImagesExplore__container' ref={wrapperElemRef}>
      <section className='ImagesExplore__section'>
        <div className='ImagesExplore__section__div ImagesExplore__fullHeight'>
          <ImagesExploreAppBar
            onBookmarkCreate={imagesExploreAppModel.onBookmarkCreate}
            onBookmarkUpdate={imagesExploreAppModel.onBookmarkUpdate}
            onResetConfigData={imagesExploreAppModel.onResetConfigData}
            title={'Images explorer'}
          />
          <div className='ImagesExplore__SelectForm__Grouping__container'>
            <SelectForm
              selectedMetricsData={imagesExploreData?.config?.select}
              onImagesExploreSelectChange={
                imagesExploreAppModel.onImagesExploreSelectChange
              }
              onSelectRunQueryChange={
                imagesExploreAppModel.onSelectRunQueryChange
              }
              onSelectAdvancedQueryChange={
                imagesExploreAppModel.onSelectAdvancedQueryChange
              }
              toggleSelectAdvancedMode={
                imagesExploreAppModel.toggleSelectAdvancedMode
              }
              onSearchQueryCopy={imagesExploreAppModel.onSearchQueryCopy}
            />
            <Grouping
              groupingData={imagesExploreData?.config?.grouping}
              groupingSelectOptions={imagesExploreData?.groupingSelectOptions}
              onGroupingSelectChange={
                imagesExploreAppModel.onGroupingSelectChange
              }
              onGroupingModeChange={imagesExploreAppModel.onGroupingModeChange}
              onGroupingPaletteChange={() => {}}
              onGroupingReset={() => {}}
              onGroupingApplyChange={
                imagesExploreAppModel.onGroupingApplyChange
              }
              onGroupingPersistenceChange={() => {}}
              onShuffleChange={() => {}}
              singleGrouping
            />
          </div>
          <div
            ref={imagesWrapperRef}
            className={`ImagesExplore__imagesWrapper__container${
              imagesExploreData?.config?.table.resizeMode ===
              ResizeModeEnum.MaxHeight
                ? '__hide'
                : ''
            }`}
          >
            <ImagesPanel
              stepSlice={imagesExploreData?.config?.images.stepSlice}
              indexSlice={imagesExploreData?.config?.images.indexSlice}
              onStepSliceChange={imagesExploreAppModel.onStepSliceChange}
              onIndexSliceChange={imagesExploreAppModel.onIndexSliceChange}
              imagesData={imagesExploreData?.imagesData}
            />
          </div>
          <ResizePanel
            className={`ImagesExplore__ResizePanel${
              imagesExploreData?.requestIsPending ||
              !isEmpty(imagesExploreData?.imagesData)
                ? ''
                : '__hide'
            }`}
            panelResizing={panelResizing}
            resizeElemRef={resizeElemRef}
            resizeMode={imagesExploreData?.config?.table.resizeMode}
            onTableResizeModeChange={
              imagesExploreAppModel.onTableResizeModeChange
            }
          />
          <div
            ref={tableElemRef}
            className={`ImagesExplore__table__container${
              imagesExploreData?.config?.table.resizeMode ===
              ResizeModeEnum.Hide
                ? '__hide'
                : ''
            }`}
          >
            <BusyLoaderWrapper
              isLoading={imagesExploreData?.requestIsPending}
              className='ImagesExplore__loader'
              height='100%'
              loaderComponent={<TableLoader />}
            >
              {!isEmpty(imagesExploreData?.tableData) ? (
                <Table
                  // deletable
                  custom
                  ref={imagesExploreData?.refs.tableRef}
                  data={imagesExploreData?.tableData}
                  columns={imagesExploreData?.tableColumns}
                  // Table options
                  topHeader
                  groups={!Array.isArray(imagesExploreData?.tableData)}
                  rowHeight={imagesExploreData?.config?.table.rowHeight}
                  rowHeightMode={
                    imagesExploreData?.config?.table.rowHeight ===
                    RowHeightSize.sm
                      ? 'small'
                      : imagesExploreData?.config?.table.rowHeight ===
                        RowHeightSize.md
                      ? 'medium'
                      : 'large'
                  }
                  sortOptions={imagesExploreData?.groupingSelectOptions}
                  sortFields={imagesExploreData?.config?.table.sortFields}
                  hiddenRows={imagesExploreData?.config?.table.hiddenMetrics}
                  hiddenColumns={imagesExploreData?.config?.table.hiddenColumns}
                  resizeMode={imagesExploreData?.config?.table.resizeMode}
                  columnsWidths={imagesExploreData?.config?.table.columnsWidths}
                  // Table actions
                  onSort={imagesExploreAppModel.onSortChange}
                  onSortReset={imagesExploreAppModel.onSortReset}
                  onExport={imagesExploreAppModel.onExportTableData}
                  onManageColumns={imagesExploreAppModel.onColumnsOrderChange}
                  onColumnsVisibilityChange={
                    imagesExploreAppModel.onColumnsVisibilityChange
                  }
                  onTableDiffShow={imagesExploreAppModel.onTableDiffShow}
                  onRowHeightChange={imagesExploreAppModel.onRowHeightChange}
                  onRowsChange={imagesExploreAppModel.onImageVisibilityChange}
                  // onRowHover={imagesExploreAppModel.onTableRowHover}
                  // onRowClick={imagesExploreAppModel.onTableRowClick}
                  onTableResizeModeChange={
                    imagesExploreAppModel.onTableResizeModeChange
                  }
                  updateColumnsWidths={
                    imagesExploreAppModel.updateColumnsWidths
                  }
                />
              ) : null}
            </BusyLoaderWrapper>
          </div>
        </div>
      </section>
      {imagesExploreData?.notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={imagesExploreAppModel.onNotificationDelete}
          data={imagesExploreData?.notifyData}
        />
      )}
    </div>
  );
}

export default ImagesExplore;
