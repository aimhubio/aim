import React from 'react';
import { isEmpty, size } from 'lodash-es';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import SelectForm from './components/SelectForm/SelectForm';
import Grouping from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';
import MetricsBar from './components/MetricsBar/MetricsBar';
import Table from 'components/Table/Table';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import { IMetricProps } from 'types/pages/metrics/Metrics';
import { ChartTypeEnum } from 'utils/d3';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import TableLoader from 'components/TableLoader/TableLoader';
import ChartLoader from 'components/ChartLoader/ChartLoader';

import './Metrics.scss';
import Icon from '../../components/Icon/Icon';

function Metrics(
  props: IMetricProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div ref={props.wrapperElemRef} className='Metrics__container'>
      <section className='Metrics__section'>
        <div className='Metrics__section__div Metrics__fullHeight'>
          <MetricsBar
            onBookmarkCreate={props.onBookmarkCreate}
            onBookmarkUpdate={props.onBookmarkUpdate}
            onResetConfigData={props.onResetConfigData}
          />
          <div className='Metrics__SelectForm__Grouping__container'>
            <SelectForm
              selectedMetricsData={props.selectedMetricsData}
              onMetricsSelectChange={props.onMetricsSelectChange}
              onSelectRunQueryChange={props.onSelectRunQueryChange}
              onSelectAdvancedQueryChange={props.onSelectAdvancedQueryChange}
              toggleSelectAdvancedMode={props.toggleSelectAdvancedMode}
            />
            <Grouping
              groupingData={props.groupingData}
              groupingSelectOptions={props.groupingSelectOptions}
              onGroupingSelectChange={props.onGroupingSelectChange}
              onGroupingModeChange={props.onGroupingModeChange}
              onGroupingPaletteChange={props.onGroupingPaletteChange}
              onGroupingReset={props.onGroupingReset}
              onGroupingApplyChange={props.onGroupingApplyChange}
              onGroupingPersistenceChange={props.onGroupingPersistenceChange}
            />
          </div>
          <div ref={props.chartElemRef} className='Metrics__chart__container'>
            <BusyLoaderWrapper
              isLoading={props.requestIsPending}
              className='Metrics__loader'
              height='100%'
              loaderComponent={<ChartLoader />}
            >
              {!!props.lineChartData?.[0]?.length ? (
                <ChartPanel
                  key={props.lineChartData?.length}
                  ref={props.chartPanelRef}
                  panelResizing={props.panelResizing}
                  chartType={ChartTypeEnum.LineChart}
                  data={props.lineChartData}
                  focusedState={props.focusedState}
                  onActivePointChange={props.onActivePointChange}
                  tooltip={props.tooltip}
                  aggregatedData={props.aggregatedData}
                  aggregationConfig={props.aggregationConfig}
                  chartTitleData={props.chartTitleData}
                  alignmentConfig={props.alignmentConfig}
                  zoomMode={props.zoomMode}
                  chartProps={[
                    {
                      axesScaleType: props.axesScaleType,
                      curveInterpolation: props.curveInterpolation,
                      displayOutliers: props.displayOutliers,
                      zoomMode: props.zoomMode,
                      highlightMode: props.highlightMode,
                    },
                  ]}
                  controls={
                    <Controls
                      selectOptions={props.groupingSelectOptions}
                      tooltip={props.tooltip}
                      smoothingAlgorithm={props.smoothingAlgorithm}
                      smoothingFactor={props.smoothingFactor}
                      curveInterpolation={props.curveInterpolation}
                      displayOutliers={props.displayOutliers}
                      zoomMode={props.zoomMode}
                      highlightMode={props.highlightMode}
                      aggregationConfig={props.aggregationConfig}
                      axesScaleType={props.axesScaleType}
                      alignmentConfig={props.alignmentConfig}
                      projectsDataMetrics={props.projectsDataMetrics}
                      onChangeTooltip={props.onChangeTooltip}
                      onDisplayOutliersChange={props.onDisplayOutliersChange}
                      onZoomModeChange={props.onZoomModeChange}
                      onHighlightModeChange={props.onHighlightModeChange}
                      onAxesScaleTypeChange={props.onAxesScaleTypeChange}
                      onSmoothingChange={props.onSmoothingChange}
                      onAggregationConfigChange={
                        props.onAggregationConfigChange
                      }
                      onAlignmentTypeChange={props.onAlignmentTypeChange}
                      onAlignmentMetricChange={props.onAlignmentMetricChange}
                    />
                  }
                />
              ) : (
                !props.requestIsPending && (
                  <EmptyComponent
                    size='big'
                    content="It's super easy to search Aim experiments. Lookup search docs to learn more."
                  />
                )
              )}
            </BusyLoaderWrapper>
          </div>
          <div
            className={`Metrics__resize ${
              props.panelResizing ? 'resizing' : ''
            }`}
            ref={props.resizeElemRef}
          >
            <Icon name='more-horizontal' />
          </div>
          <div ref={props.tableElemRef} className='Metrics__table__container'>
            <BusyLoaderWrapper
              isLoading={props.requestIsPending}
              className='Metrics__loader'
              height='100%'
              loaderComponent={<TableLoader />}
            >
              {!isEmpty(props.tableData) ? (
                <Table
                  custom
                  key={`${props.tableColumns.length}-${size(props.tableData)}`}
                  ref={props.tableRef}
                  data={props.tableData}
                  columns={props.tableColumns}
                  // Table options
                  topHeader
                  groups={!Array.isArray(props.tableData)}
                  rowHeight={props.tableRowHeight}
                  sortOptions={props.groupingSelectOptions}
                  // Table actions
                  onSort={() => null}
                  onExport={props.onExportTableData}
                  onManageColumns={() => null}
                  onRowHeightChange={() => null}
                  onRowsChange={() => null}
                  onRowHover={props.onTableRowHover}
                  onRowClick={props.onTableRowClick}
                />
              ) : null}
            </BusyLoaderWrapper>
          </div>
        </div>
      </section>
      {props.notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={props.onNotificationDelete}
          data={props.notifyData}
        />
      )}
    </div>
  );
}

export default React.memo(Metrics);
