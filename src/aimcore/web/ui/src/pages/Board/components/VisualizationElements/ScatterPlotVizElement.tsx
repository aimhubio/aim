import * as React from 'react';

import {
  ResponsiveScatterPlot,
  ResponsiveScatterPlotCanvas,
} from '@nivo/scatterplot';

import { Box, Text } from 'components/kit_v2';

function ScatterPlotVizElement(props: any) {
  const parsedData = React.useMemo(() => {
    let pointsCount = 0;
    const data = props.data.map((item: any) => {
      return {
        id: item.name,
        color: item.color,
        data: item.data.xValues.map((dataItem: number, index: number) => {
          pointsCount += +item.data.yValues.length;
          return {
            x: dataItem,
            y: item.data.yValues[index],
          };
        }),
      };
    });
    return {
      data,
      pointsCount,
    };
  }, [props.data]);

  const ScatterElement = React.useCallback(() => {
    let commonProps: any = {
      data: parsedData.data,
      margin: { top: 50, right: 90, bottom: 50, left: 60 },
      xScale: { type: 'linear' },
      yScale: { type: 'linear' },
      tooltip: ({ node }: any) => {
        return (
          <Box
            key={node.id}
            css={{
              background: 'white',
              br: '$3',
              padding: '$6 $8',
              border: '1px solid #ccc',
            }}
          >
            <Text weight='$4' as='strong'>
              {node.serieId}
            </Text>
            <Box
              css={{
                padding: '3px 0',
              }}
            >
              <Text css={{ mr: '$5' }}>x:</Text>
              <Text color={node.color}>{node.x}</Text>
            </Box>
            <Box
              css={{
                padding: '3px 0',
              }}
            >
              <Text css={{ mr: '$5' }}>y:</Text>
              <Text color={node.color}>{node.y}</Text>
            </Box>
          </Box>
        );
      },
      nodeSize: 8,
      axisTop: null,
      axisRight: null,
      axisBottom: {
        tickSize: 4,
        tickPadding: 4,
        tickRotation: 0,
        legendOffset: 36,
        legendPosition: 'middle',
      },
      axisLeft: {
        tickSize: 4,
        tickPadding: 4,
        tickRotation: 0,
        legendOffset: -55,
        legendPosition: 'middle',
      },
      legends: [
        {
          anchor: 'top-right',
          direction: 'column',
          justify: false,
          translateX: 110,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 8,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ],
    };
    if (parsedData.pointsCount > 600) {
      return <ResponsiveScatterPlotCanvas {...commonProps} />;
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
    return <ResponsiveScatterPlot {...commonProps} />;
  }, [parsedData]);

  return (
    <div className='VizComponentContainer'>
      <ScatterElement />
    </div>
  );
}

export default ScatterPlotVizElement;
