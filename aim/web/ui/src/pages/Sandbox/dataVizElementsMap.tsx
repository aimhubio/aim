import * as React from 'react';

import ChartPanel from 'components/ChartPanel/ChartPanel';

import { ChartTypeEnum, CurveEnum, ScaleEnum, HighlightEnum } from 'utils/d3';

import DataGrid from './DataGrid';

export const dataVizElementsMap = {
  linechart: (props: any) => (
    <ChartPanel
      selectOptions={[]}
      chartType={ChartTypeEnum.LineChart}
      data={props.data}
      focusedState={{
        key: null,
        active: false,
      }}
      tooltip={{}}
      zoom={{}}
      onActivePointChange={props.callbacks?.on_active_point_change ?? null}
      onChangeTooltip={() => null}
      chartProps={props.data.map(() => ({
        axesScaleType: {
          xAxis: ScaleEnum.Linear,
          yAxis: ScaleEnum.Linear,
        },
        ignoreOutliers: false,
        highlightMode: HighlightEnum.Off,
        curveInterpolation: CurveEnum.Linear,
      }))}
      onRunsTagsChange={() => null}
      controls={null}
    />
  ),
  dataframe: (props: any) => (
    <DataGrid
      data={
        typeof props.data === 'string' ? JSON.parse(props.data) : props.data
      }
    />
  ),
};
