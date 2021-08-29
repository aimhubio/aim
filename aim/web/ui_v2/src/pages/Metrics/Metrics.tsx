import React from 'react';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import SelectForm from './components/SelectForm/SelectForm';
import Grouping from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';
import AppBar from './components/MetricsBar/MetricsBar';
import Table from 'components/Table/Table';
import ChartPanel from 'components/ChartPanel/ChartPanel';

import { IMetricProps } from 'types/pages/metrics/Metrics';
import { ChartTypeEnum } from 'utils/d3';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import './Metrics.scss';

function Metrics(
  props: IMetricProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div ref={props.wrapperElemRef} className='Metrics__container'>
      <section className='Metrics__section'>
        <div className='Metrics__section__div Metrics__fullHeight'>
          <div>
            <AppBar
              onBookmarkCreate={props.onBookmarkCreate}
              onBookmarkUpdate={props.onBookmarkUpdate}
              onResetConfigData={props.onResetConfigData}
            />
          </div>
          <div>
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
                onGroupingSelectChange={props.onGroupingSelectChange}
                onGroupingModeChange={props.onGroupingModeChange}
                onGroupingPaletteChange={props.onGroupingPaletteChange}
                onGroupingReset={props.onGroupingReset}
                onGroupingApplyChange={props.onGroupingApplyChange}
                onGroupingPersistenceChange={props.onGroupingPersistenceChange}
              />
            </div>
          </div>
          <div ref={props.chartElemRef} className='Metrics__chart__container'>
            {!!props.lineChartData?.[0]?.length ? (
              <ChartPanel
                key={props.lineChartData.length}
                ref={props.chartPanelRef}
                chartType={ChartTypeEnum.LineChart}
                data={props.lineChartData}
                focusedState={props.focusedState}
                onActivePointChange={props.onActivePointChange}
                tooltip={props.tooltip}
                aggregatedData={props.aggregatedData}
                aggregationConfig={props.aggregationConfig}
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
                    selectOptions={props.groupingData?.selectOptions}
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
                    onChangeTooltip={props.onChangeTooltip}
                    onDisplayOutliersChange={props.onDisplayOutliersChange}
                    onZoomModeChange={props.onZoomModeChange}
                    onHighlightModeChange={props.onHighlightModeChange}
                    onAxesScaleTypeChange={props.onAxesScaleTypeChange}
                    onSmoothingChange={props.onSmoothingChange}
                    onAggregationConfigChange={props.onAggregationConfigChange}
                    onAlignmentTypeChange={props.onAlignmentTypeChange}
                    onAlignmentMetricChange={props.onAlignmentMetricChange}
                  />
                }
              />
            ) : null}
          </div>
          <div ref={props.resizeElemRef}>
            <div className='Metrics__resize'>
              <MoreHorizIcon />
            </div>
          </div>
          <div ref={props.tableElemRef} className='Metrics__table__container'>
            {props.tableData?.length > 0 ? (
              <Table
                ref={props.tableRef}
                data={props.tableData}
                columns={props.tableColumns}
                // Table options
                rowHeight={props.tableRowHeight}
                sortOptions={props.groupingData.selectOptions}
                // Table actions
                onSort={() => null}
                onExport={() => null}
                onManageColumns={() => null}
                onRowHeightChange={() => null}
                onRowsChange={() => null}
                onRowHover={props.onTableRowHover}
                onRowClick={props.onTableRowClick}
              />
            ) : null}
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
