import React from 'react';

import { ResponsiveLine } from '@nivo/line';

import { Box, Text } from 'components/kit_v2';

function NivoLineChartVizElement(props: any) {
  const modifyData = React.useMemo(() => {
    return props.data.map((item: any) => {
      return {
        id: item.name,
        color: item.color,
        data: item.data.xValues.map((dataItem: number, index: number) => {
          return {
            x: dataItem,
            y: item.data.yValues[index],
          };
        }),
      };
    });
  }, [props.data]);
  return (
    <div className='VizComponentContainer'>
      <ResponsiveLine
        data={modifyData}
        enablePoints={false}
        lineWidth={1}
        colors={(d) => d.color}
        margin={{ top: 50, right: 90, bottom: 50, left: 60 }}
        sliceTooltip={({ slice }) => {
          return (
            <Box
              css={{
                background: 'white',
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
                    color: point.serieColor,
                    padding: '3px 0',
                  }}
                >
                  <Text>{point.serieId}</Text>
                  <Text color={point.color}>[{point.data.yFormatted}]</Text>
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
        yFormat=' >-.2f'
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
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 10,
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
