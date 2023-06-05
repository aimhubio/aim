import * as React from 'react';

import { ResponsiveBar } from '@nivo/bar';

const BarChart = (props: any) => {
  const keys = props.data.map((item: any) => item.data.x);
  const parsedData = React.useMemo(() => {
    return props.data.map((item: any) => {
      return {
        id: item.name,
        x: item.data.x,
        y: item.data.y,
        color: item.color,
        [item.data.x]: item.data.y,
        [`${item.data.x}Color`]: item.color,
      };
    });
  }, [props.data]);

  return (
    <div className='VizComponentContainer'>
      <ResponsiveBar
        data={parsedData}
        keys={keys}
        margin={{ top: 50, right: 90, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear', reverse: false }}
        indexScale={{ type: 'band', round: true }}
        colors={(d: any) => {
          let bar = parsedData.find((item: any) => item.id === d.id);
          return bar?.color ?? '#000';
        }}
        groupMode='stacked'
        colorBy='id'
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: 'middle',
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'top-right',
            direction: 'column',
            justify: false,
            translateX: 110,
            translateY: 0,
            itemsSpacing: 0,
            itemWidth: 80,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.75,
            symbolSize: 8,
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
};

export default BarChart;
