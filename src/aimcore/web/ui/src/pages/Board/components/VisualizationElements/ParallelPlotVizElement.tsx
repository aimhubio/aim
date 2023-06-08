import React from 'react';

import {
  ResponsiveParallelCoordinates,
  ResponsiveParallelCoordinatesCanvas,
  // @ts-ignore @TODO: types doesn't exists yet
} from '@nivo/parallel-coordinates';

import { ScaleEnum } from 'utils/d3';

type Datum = {
  key: string | number;
  [key: string]: number | string;
};

type Line = {
  key: string | number;
  name: string;
  color: string;
  data: {
    values: Record<string, number>;
    dimensions: string[];
  };
};

function ParallelPlotVizElement(props: { data: Line[] }) {
  const { data, variables } = React.useMemo(() => {
    const dimensions = props.data?.[0]?.data.dimensions || [];
    const variables = dimensions.map((dimension: string) => ({
      type: ScaleEnum.Linear,
      key: dimension,
      legend: dimension,
      ticksPosition: 'before',
      legendPosition: 'start',
      legendOffset: 20,
    }));

    const data: Datum[] = props.data.map((line, i) => ({
      ...line.data.values,
      key: line.key || i,
    }));
    return { data, variables, dimensions };
  }, [props.data]);

  const ParallelPlotElement = React.useCallback(() => {
    let commonProps: any = {
      data,
      variables,
      margin: { top: 50, right: 60, bottom: 50, left: 60 },
      layout: 'horizontal',
      curve: 'linear',
      strokeWidth: 2,
      colors: (d: Datum) => {
        const line = props.data.find((line: Line) => line.key === d.key);
        return line?.color ?? '#000';
      },
      theme: {
        tooltip: {
          container: {
            background: '#ffffff',
            fontSize: 12,
          },
          basic: {},
          chip: {},
          table: {},
          tableCell: {},
          tableCellValue: {},
        },
        axis: {
          ticks: {
            line: {
              stroke: '#dddddd',
              strokeWidth: 1,
              strokeLinecap: 'square',
            },
          },
          domain: {
            line: {
              stroke: '#dddddd',
              strokeWidth: 1,
              strokeLinecap: 'square',
            },
          },
        },
      },
      // @TODO: tooltip not working yet
      // tooltip: CustomTooltipComponent,
      // @TODO: legends not working yet
      legends: [
        {
          anchor: 'right',
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 60,
          itemHeight: 20,
          itemDirection: 'left-to-right',
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: 'hover',
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ],
    };

    if (data.length > 600) {
      return <ResponsiveParallelCoordinatesCanvas {...commonProps} />;
    }

    commonProps['layers'] = [
      'grid',
      'axes',
      'markers',
      'mesh',
      'legends',
      'annotations',
      'nodes',
    ];
    commonProps.blendMode = 'darken';

    return <ResponsiveParallelCoordinates {...commonProps} />;
  }, [data, variables, props.data]);

  return (
    <div className='VizComponentContainer'>
      <ParallelPlotElement />
    </div>
  );
}

export default ParallelPlotVizElement;
