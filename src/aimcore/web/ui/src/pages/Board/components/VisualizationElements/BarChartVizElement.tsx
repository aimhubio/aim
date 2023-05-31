import * as React from 'react';
import {
  Chart,
  LineController,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  LineController,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
);

const BarChart = (props: any) => {
  const chartRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (chartRef.current !== null) {
      const newChartInstance: any = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: Array.from({ length: 1000 }, (_, i) => i + 1),
          datasets: props.data.map((item: any) => {
            const dataPoints = item.data.x.map(
              (xValue: number, index: number) => {
                return { x: xValue, y: item.data.y[index] };
              },
            );
            return {
              label: item.name,
              data: dataPoints,
              fill: false,
              backgroundColor: item.color,
              borderColor: item.color,
              borderWidth: 1,
            };
          }),
        },
        options: {
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          onClick: function (event: any, activeElements, chart: any) {
            // Get the index of the clicked point
            const index = activeElements[0].index;

            chart.update();
            chart.setActiveElements([{ datasetIndex: 0, index: 1 }]);
          },

          plugins: {
            title: {
              display: true,
              text: 'Chart.js Line Chart - Multi Axis',
            },
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',

              // grid line settings
              grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
              },
            },
          },
          // actions: {},
        },
      });

      return () => {
        newChartInstance.destroy();
      };
    }
  }, [chartRef, props.data]); // Re-run effect when props.data or chartRef change

  return <canvas ref={chartRef} />;
};

export default BarChart;
