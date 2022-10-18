import * as React from 'react';

import Figures from 'modules/BaseExplorer/components/Figures/Figures';

import ChartPanel from 'components/ChartPanel/ChartPanel';
import DictVisualizer from 'components/kit/DictVisualizer';

import { ChartTypeEnum, CurveEnum, ScaleEnum, HighlightEnum } from 'utils/d3';

import DataGrid from './DataGrid';
import ImagesList from './ImagesList';
import AudiosList from './AudiosList';
import TextList from './TextList';

export const dataVizElementsMap = {
  LineChart: (props: any) => (
    <ChartPanel
      selectOptions={[]}
      chartType={ChartTypeEnum.LineChart}
      data={[props.data]}
      focusedState={{
        key: null,
        active: false,
      }}
      tooltip={{}}
      zoom={{}}
      onActivePointChange={props.callbacks?.on_active_point_change ?? null}
      onChangeTooltip={() => null}
      chartProps={[
        {
          axesScaleType: {
            xAxis: ScaleEnum.Linear,
            yAxis: ScaleEnum.Linear,
          },
          ignoreOutliers: false,
          highlightMode: HighlightEnum.Off,
          curveInterpolation: CurveEnum.Linear,
        },
      ]}
      onRunsTagsChange={() => null}
      controls={null}
    />
  ),
  DataFrame: (props: any) => (
    <DataGrid
      data={
        typeof props.data === 'string' ? JSON.parse(props.data) : props.data
      }
    />
  ),
  Plotly: (props: any) => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Figures data={{ data: props }} style={{}} />
    </div>
  ),
  Images: (props: any) => <ImagesList key={Date.now()} data={props.data} />,
  Audios: (props: any) => <AudiosList key={Date.now()} data={props.data} />,
  Text: (props: any) => <TextList key={Date.now()} data={props.data} />,
  JSON: (props: any) => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <DictVisualizer src={props.data} />
    </div>
  ),
};
