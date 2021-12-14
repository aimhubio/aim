import React, { useState } from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { isEmpty } from 'lodash-es';

import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import TableLoader from 'components/TableLoader/TableLoader';
import Table from 'components/Table/Table';
import ResizePanel from 'components/ResizePanel/ResizePanel';
import MediaPanel from 'components/MediaPanel';
import { MediaTypeEnum } from 'components/MediaPanel/config';
import ImagesExploreRangePanel from 'components/ImagesExploreRangePanel';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';
import GroupingPopovers from 'config/grouping/GroupingPopovers';

import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';
import useResizeObserver from 'hooks/window/useResizeObserver';

import SelectForm from 'pages/ImagesExplore/components/SelectForm/SelectForm';
import Grouping from 'pages/components/Grouping/Grouping';
import Controls from 'pages/ImagesExplore/components/Controls/Controls';

import imagesExploreAppModel from 'services/models/imagesExplore/imagesExploreAppModel';
import * as analytics from 'services/analytics';

import {
  IFocusedState,
  IGroupingSelectOption,
  IPanelTooltip,
} from 'types/services/models/metrics/metricsAppModel';

import getStateFromUrl from 'utils/getStateFromUrl';
import { ChartTypeEnum } from 'utils/d3';

import ImagesExploreAppBar from './components/ImagesExploreAppBar/ImagesExploreAppBar';

import './ImagesExplore.scss';

function ImagesExplore(): React.FunctionComponentElement<React.ReactNode> {
  const route = useRouteMatch<any>();
  const location = useLocation();
  const imagesExploreData = useModel<Partial<any>>(imagesExploreAppModel);
  const imagesWrapperRef = React.useRef<any>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);
  const [offsetHeight, setOffsetHeight] = useState(
    imagesWrapperRef?.current?.offsetHeight,
  );

  const [offsetWidth, setOffsetWidth] = useState(
    imagesWrapperRef?.current?.offsetWidth,
  );

  useResizeObserver(
    () => setOffsetWidth(imagesWrapperRef?.current?.offsetWidth),
    imagesWrapperRef,
  );

  const panelResizing = usePanelResize(
    wrapperElemRef,
    imagesWrapperRef,
    tableElemRef,
    resizeElemRef,
    imagesExploreData?.config?.table || {},
    imagesExploreAppModel.onTableResizeEnd,
  );

  React.useEffect(() => {
    setOffsetWidth(imagesWrapperRef?.current?.offsetWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesWrapperRef?.current?.offsetWidth]);

  React.useEffect(() => {
    setOffsetHeight(imagesWrapperRef?.current?.offsetHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    imagesWrapperRef?.current?.offsetHeight,
    imagesExploreData?.config?.table.resizeMode,
  ]);
  React.useEffect(() => {
    imagesExploreAppModel.initialize(route.params.appId);
    let appRequestRef: {
      call: () => Promise<void>;
      abort: () => void;
    };
    let imagesRequestRef: {
      call: () => Promise<void>;
      abort: () => void;
    };
    if (route.params.appId) {
      appRequestRef = imagesExploreAppModel.getAppConfigData(
        route.params.appId,
      );
      appRequestRef.call().then(() => {
        imagesRequestRef = imagesExploreAppModel.getImagesData();
        imagesRequestRef.call();
      });
    } else {
      imagesExploreAppModel.setDefaultAppConfigData();
      imagesRequestRef = imagesExploreAppModel.getImagesData();
      imagesRequestRef.call();
    }

    analytics.pageView('[ImagesExplorer]');
    return () => {
      imagesRequestRef?.abort();
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
              requestIsPending={imagesExploreData?.requestIsPending}
              selectedImagesData={imagesExploreData?.config?.select}
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
              searchButtonDisabled={imagesExploreData?.searchButtonDisabled}
            />
            <Grouping
              groupingPopovers={GroupingPopovers.filter(
                (g) => g.groupName === 'group',
              )}
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
            <MediaPanel
              mediaType={MediaTypeEnum.IMAGE}
              getBlobsData={imagesExploreAppModel.getImagesBlobsData}
              data={imagesExploreData?.imagesData}
              orderedMap={imagesExploreData?.orderedMap}
              isLoading={imagesExploreData?.requestIsPending}
              panelResizing={panelResizing}
              resizeMode={imagesExploreData?.config?.table.resizeMode}
              tableHeight={imagesExploreData?.config?.table?.height}
              wrapperOffsetHeight={offsetHeight || 0}
              wrapperOffsetWidth={offsetWidth || 0}
              focusedState={
                imagesExploreData?.config?.images?.focusedState as IFocusedState
              }
              tooltip={
                imagesExploreData?.config?.images?.tooltip as IPanelTooltip
              }
              additionalProperties={
                imagesExploreData?.config?.images?.additionalProperties
              }
              onActivePointChange={imagesExploreAppModel.onActivePointChange}
              controls={
                <Controls
                  selectOptions={
                    imagesExploreData?.groupingSelectOptions as IGroupingSelectOption[]
                  }
                  tooltip={
                    imagesExploreData?.config?.images?.tooltip as IPanelTooltip
                  }
                  additionalProperties={
                    imagesExploreData?.config?.images?.additionalProperties
                  }
                  onChangeTooltip={imagesExploreAppModel?.onChangeTooltip}
                  onImageSizeChange={imagesExploreAppModel.onImageSizeChange}
                  onImageRenderingChange={
                    imagesExploreAppModel.onImageRenderingChange
                  }
                  onImageAlignmentChange={
                    imagesExploreAppModel.onImageAlignmentChange
                  }
                />
              }
              tooltipType={ChartTypeEnum.ImageSet}
              actionPanelSize={44}
              actionPanel={
                imagesExploreData?.config?.images?.stepRange &&
                imagesExploreData?.config?.images?.indexRange &&
                imagesExploreAppModel.isRangePanelShow() && (
                  <ImagesExploreRangePanel
                    recordSlice={imagesExploreData?.config?.images?.recordSlice}
                    indexSlice={imagesExploreData?.config?.images?.indexSlice}
                    indexRange={imagesExploreData?.config?.images?.indexRange}
                    stepRange={imagesExploreData?.config?.images?.stepRange}
                    applyButtonDisabled={imagesExploreData?.applyButtonDisabled}
                    indexDensity={
                      imagesExploreData?.config?.images?.indexDensity
                    }
                    recordDensity={
                      imagesExploreData?.config?.images?.recordDensity
                    }
                    onSliceRangeChange={
                      imagesExploreAppModel.onSliceRangeChange
                    }
                    onDensityChange={imagesExploreAppModel.onDensityChange}
                  />
                )
              }
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
                  //@TODO add hide sequence functionality
                  // onRowsChange={imagesExploreAppModel.onImageVisibilityChange}
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
