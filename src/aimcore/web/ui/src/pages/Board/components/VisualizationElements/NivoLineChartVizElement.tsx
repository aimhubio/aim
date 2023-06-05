import React from 'react';

import { ResponsiveLine, ResponsiveLineCanvas } from '@nivo/line';

import { Box, Text } from 'components/kit_v2';

function NivoLineChartVizElement(props: any) {
  const parsedData = React.useMemo(() => {
    let pointsCount = 0;
    const data = props.data.map((item: any) => {
      return {
        id: item.name,
        color: item.color,
        data: item.data.xValues.map((dataItem: number, index: number) => {
          pointsCount += item.data.yValues.length;
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

  const LineChartElement = React.useCallback(() => {
    let commonProps: any = {
      data: parsedData.data,
      lineWidth: 1,
      colors: (d: any) => d.color,
      margin: { top: 50, right: 90, bottom: 50, left: 60 },
      xScale: { type: 'linear', reverse: false },
      yScale: { type: 'linear', reverse: false },
      tooltip: ({ point }: any) => {
        return (
          <Box
            key={point.id}
            css={{
              background: 'white',
              br: '$3',
              padding: '$6 $8',
              border: '1px solid #ccc',
            }}
          >
            <Text weight='$4' as='strong'>
              {point.serieId}
            </Text>
            <Box
              css={{
                padding: '3px 0',
              }}
            >
              <Text css={{ mr: '$5' }}>x:</Text>
              <Text color={point.color}>{point.x}</Text>
            </Box>
            <Box
              css={{
                padding: '3px 0',
              }}
            >
              <Text css={{ mr: '$5' }}>y:</Text>
              <Text color={point.color}>{point.y}</Text>
            </Box>
          </Box>
        );
      },
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
      pointSize: 4,
      pointBorderWidth: 1,
      pointLabelYOffset: -12,
      useMesh: true,
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
      return <ResponsiveLineCanvas {...commonProps} />;
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
    return <ResponsiveLine {...commonProps} />;
  }, [parsedData]);

  return (
    <div className='VizComponentContainer'>
      <LineChartElement />
    </div>
  );
}

export default React.memo(NivoLineChartVizElement);
