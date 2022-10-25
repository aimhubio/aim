import * as React from 'react';
import * as _ from 'lodash-es';

import ChartPanel from 'components/ChartPanel/ChartPanel';
import DictVisualizer from 'components/kit/DictVisualizer';

import { ChartTypeEnum, CurveEnum, ScaleEnum, HighlightEnum } from 'utils/d3';

import DataTable from './DataTable';
import ImagesList from './ImagesList';
import AudiosList from './AudiosList';
import TextList from './TextList';
import FiguresList from './FiguresList';

export const dataVizElementsMap = {
  LineChart: (props: any) => {
    const onActivePointChange = React.useCallback(
      _.debounce(props.callbacks?.on_active_point_change, 100),
      [],
    );

    return (
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
        onActivePointChange={onActivePointChange}
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
    );
  },
  DataFrame: (props: any) => (
    <DataTable
      data={
        typeof props.data === 'string' ? JSON.parse(props.data) : props.data
      }
    />
  ),
  Plotly: (props: any) => <FiguresList key={Date.now()} data={props.data} />,
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
