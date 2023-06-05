import React from 'react';

import { ResponsiveLine } from '@nivo/line';

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
        margin={{ top: 50, right: 90, bottom: 50, left: 60 }}
        xScale={{
          type: 'linear',
          reverse: false,
        }}
        yScale={{
          type: 'linear',
          reverse: false,
        }}
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
