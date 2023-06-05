import React from 'react';

import { ResponsiveLine } from '@nivo/line';

import { Box, Text } from 'components/kit_v2';

function NivoLineChartVizElement(props: any) {
  const modifyData = React.useMemo(() => {
    let maxPointsCount = 0;
    const data = props.data.map((item: any) => {
      return {
        id: item.name,
        color: item.color,
        data: item.data.xValues.map((dataItem: number, index: number) => {
          if (item.data.yValues.length > maxPointsCount) {
            maxPointsCount = item.data.yValues[index].length;
          }
          return {
            x: dataItem,
            y: item.data.yValues[index],
          };
        }),
      };
    });
    return {
      data,
      maxPointsCount,
    };
  }, [props.data]);

  return (
    <div className='VizComponentContainer'>
      <ResponsiveLine
        data={modifyData.data}
        enablePoints={modifyData.maxPointsCount < 100}
        lineWidth={1}
        colors={(d) => d.color}
        margin={{ top: 50, right: 90, bottom: 50, left: 60 }}
        sliceTooltip={({ slice }) => {
          return (
            <Box
              key={slice.x}
              css={{
                background: 'white',
                br: '$3',
                padding: '$6 $8',
                border: '1px solid #ccc',
              }}
            >
              <Text weight='$4' as='strong'>
                x: {slice.id}
              </Text>
              {slice.points.map((point) => (
                <Box
                  key={point.id}
                  css={{
                    padding: '3px 0',
                  }}
                >
                  <Text css={{ mr: '$5' }} color={point.serieColor}>
                    {point.serieId}:
                  </Text>
                  <Text>{point.data.y}</Text>
                </Box>
              ))}
            </Box>
          );
        }}
        xScale={{
          type: 'linear',
          reverse: false,
        }}
        yScale={{
          type: 'linear',
          reverse: false,
        }}
        enableSlices='x'
        enableCrosshair={true}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
          legendOffset: 36,
          legendPosition: 'middle',
        }}
        axisLeft={{
          tickSize: 4,
          tickPadding: 4,
          tickRotation: 0,
          legendOffset: -55,
          legendPosition: 'middle',
        }}
        pointSize={4}
        pointBorderWidth={1}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: 'top-right',
            direction: 'column',
            justify: false,
            translateX: 100,
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
        ]}
      />
    </div>
  );
}

export default React.memo(NivoLineChartVizElement);
