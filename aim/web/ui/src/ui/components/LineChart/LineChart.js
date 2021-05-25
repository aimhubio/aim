import '../LineChart/LineChart.less';

import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const colors = [
  '#142447',
  '#28A745',
  '#f39c12',
  '#9b59b6',
  '#B2393D',
  '#484F56',
];

export default class LineChart extends React.Component {
  constructor(props) {
    super(props);

    let series = [];
    const smooth = this.getSmoothSeries();
    const dataSeries = this.getSeriesFromData(this.props.data);
    if (smooth) {
      series.push(smooth);
    }
    for (let s = 0; s < dataSeries.length; s++) {
      series.push(dataSeries[s]);
    }

    this.state = {
      doubleClicker: {
        clickedOnce: false,
        timer: null,
        timeBetweenClicks: 400,
      },
      options: {
        chart: {
          type: 'line',
          zoomType: 'xy',
          spacing: [30, 20, 15, 15],
          height: 350,
          events: {
            click: () => this.chartClick(),
          },
          resetZoomButton: {
            theme: {
              display: 'none',
            },
          },
        },

        title: {
          text: null,
        },

        subtitle: {
          text: null,
        },

        credits: {
          enabled: false,
        },

        legend: {
          enabled: false,
        },

        xAxis: {
          labels: {
            align: 'center',
          },
          /*
          tickWidth: 0,
          gridLineWidth: 0,
          gridLineColor: '#DFE6F7',
          tickColor: '#DFE6F7',
           */
          lineColor: '#DFE6F7',
        },

        yAxis: {
          title: {
            enabled: false,
          },
          tickWidth: 1,
          lineWidth: 1,
          gridLineWidth: 1,
          gridLineColor: '#f0f3fa',
          tickColor: '#DFE6F7',
          lineColor: '#DFE6F7',
        },

        series: series,
      },
    };

    this.chartRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.data !== this.props.data ||
      prevProps.dim !== this.props.dim
    ) {
      if (this.chartRef.current.chart) {
        const seriesIndex = this.props.smooth ? 1 : 0;
        while (this.chartRef.current.chart.series.length > seriesIndex) {
          this.chartRef.current.chart.series[seriesIndex].remove();
        }
        const series = this.getSeriesFromData(this.props.data);
        for (let s = 0; s < series.length; s++) {
          this.chartRef.current.chart.addSeries(series[s]);
        }
      }
    }
  }

  getSeriesFromData = (data) => {
    let series = [];

    if (this.props.dim === -1) {
      data = [data];
    }

    const l = this.props.dim !== -1 ? this.props.dim : 1;

    for (let s = 0; s < l; s++) {
      if (!data[s]) {
        continue;
      }

      let headerPrefix = '';
      if (typeof this.props.header === 'string') {
        headerPrefix = `${this.props.header}: `;
      } else if (
        typeof this.props.header === 'object' &&
        Array.isArray(this.props.header)
      ) {
        headerPrefix = `${this.props.header[s]}: `;
      }

      series.push({
        type: 'line',
        data: data[s],
        color: colors[s % colors.length],
        lineWidth: 1,
        tooltip: {
          headerFormat: '',
          pointFormat: `${headerPrefix}{point.x} - <b>{point.y}</b>`,
        },
        marker: {
          enabled: true,
          radius: 0,
          fillColor: '#FFFFFF',
          lineWidth: 1,
          lineColor: colors[s % colors.length],
          symbol: 'circle',
          states: {
            hover: {
              radius: 3,
            },
          },
        },
      });
    }

    return series;
  };

  getSmoothSeries = () => {
    if (!this.props.smooth || this.props.dim > 1) {
      return null;
    }

    return {
      type: 'line',
      data: this.smoothData(this.props.data),
      color: '#D4D4D4',
      lineWidth: 2,
      tooltip: {
        headerFormat: '',
        pointFormat: 'Smoothed: {point.x} - <b>{point.y}</b>',
      },
      marker: {
        enabled: true,
        radius: 0,
        fillColor: '#FFFFFF',
        lineWidth: 1,
        lineColor: '#999',
        symbol: 'circle',
        states: {
          hover: {
            radius: 3,
          },
        },
      },
      states: {
        hover: {
          enabled: true,
          lineColor: '#484F56',
        },
      },
    };
  };

  chartClick = () => {
    const resetZoom = this.resetZoom;

    this.setState((prevState) => {
      const clickerState = prevState.doubleClicker;
      const now = +new Date();

      let clickedOnce = true;
      let timer = now;

      if (clickerState.clickedOnce) {
        if (
          clickerState.timer &&
          now - clickerState.timer < clickerState.timeBetweenClicks
        ) {
          // Double clicked
          clickedOnce = false;
          timer = null;
          resetZoom();
        }
      }

      return {
        ...prevState,
        doubleClicker: Object.assign({}, clickerState, {
          clickedOnce: clickedOnce,
          timer: timer,
        }),
      };
    });
  };

  resetZoom = () => {
    this.chartRef.current.chart.xAxis[0].setExtremes(null, null);
    this.chartRef.current.chart.yAxis[0].setExtremes(null, null);
  };

  smoothData = (data) => {
    if (data.length <= 10) {
      return [];
    }

    let range = data.length * 0.2;

    let smoothData = [];

    let i = 0;
    while (i < data.length) {
      let tempValues = [];
      if (i >= range && i < data.length - range) {
        tempValues = data.slice(i - range / 2, i + range / 2);
      } else {
        if (i < range) {
          tempValues = data.slice(i, i + range);
        }
        if (i >= data.length - range) {
          tempValues = data.slice(i - range, i);
        }
      }

      smoothData.push(
        tempValues.reduce((a, b) => a + b, 0) / tempValues.length,
      );

      i++;
    }

    return smoothData;
  };

  render() {
    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={this.state.options}
        ref={this.chartRef}
      />
    );
  }
}

LineChart.defaultProps = {
  xAxisFormat: 'step',
  header: '',
  dim: -1,
  smooth: true,
};

LineChart.propTypes = {
  xAxisFormat: PropTypes.oneOf(['step']),
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  data: PropTypes.array,
  dim: PropTypes.number,
  smooth: PropTypes.bool,
};
