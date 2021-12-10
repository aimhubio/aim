import React from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import addHeatmap from 'highcharts/modules/heatmap';

class Heatmap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      options: {
        chart: {
          type: 'heatmap',
          marginTop: 10,
          marginRight: 80,
          height: 180,
          spacing: [10, 20, 10, 10],
        },

        credits: {
          enabled: false,
        },

        boost: {
          useGPUTranslations: true,
        },

        title: {
          text: null,
        },

        subtitle: {
          text: null,
        },

        xAxis: {
          categories: this.serializeX(),
          labels: {
            align: 'center',
          },
          showLastLabel: true,
          plotLines: this.getPlotLines(this.props.cursor),
        },

        yAxis: {
          categories: this.serializeY(),
          title: {
            enabled: false,
          },
          showLastLabel: false,
          reversed: true,
        },

        legend: {
          align: 'right',
          layout: 'vertical',
          padding: 0,
          margin: 10,
          itemMarginTop: 0,
          itemMarginBottom: 0,
          verticalAlign: 'center',
          symbolHeight: 150,
        },

        colorAxis: {
          stops: [
            [0, '#ffffff'],
            [0.25, '#abcaf6'],
            [0.5, '#77a8ef'],
            [0.75, '#3578e6'],
            [1, '#225ae0'],
          ],
          min: 0,
          max: 1,
        },
        series: [
          {
            name: this.props.name,
            tooltip: {
              pointFormatter: this.tooltipFormatter(),
            },
            data: this.serializeData(this.props.data),
            events: {
              click: this.props.click,
            },
            dataLabels: {
              enabled: false,
            },
          },
        ],
      },
    };

    this.chartRef = React.createRef();
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillMount() {
    addHeatmap(Highcharts);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.x !== this.props.x) {
      this.chartRef.current.chart.update({
        xAxis: {
          categories: this.serializeX(),
        },
      });
    }

    if (prevProps.y !== this.props.y) {
      this.chartRef.current.chart.update({
        yAxis: {
          categories: this.serializeY(),
        },
      });
    }

    if (
      prevProps.data !== this.props.data ||
      prevProps.max !== this.props.max
    ) {
      this.chartRef.current.chart.series[0].update({
        data: this.serializeData(this.props.data),
        tooltip: {
          pointFormatter: this.tooltipFormatter(),
        },
      });
    }

    if (prevProps.cursor !== this.props.cursor) {
      let xAxis = Object.assign({}, this.state.xAxis);
      xAxis.plotLines = this.getPlotLines(this.props.cursor);

      this.chartRef.current.chart.update({
        xAxis,
      });
    }
  }

  serializeData = (data) => {
    return data.map((item) => {
      if (this.props.max !== 0) {
        return [item[0], item[1], item[2] / this.props.max];
      } else {
        return [item[0], item[1], 0];
      }
    });
  };

  serializeY = () => {
    return this.props.y.map((item) => {
      return '' + Math.round(item * 10000) / 10000;
    });
  };

  serializeX = () => {
    return this.props.x.map((item) => {
      return `${item}`;
    });
  };

  getPlotLines = (v) => {
    return [
      {
        color: '#243969',
        width: 2,
        value: v,
        zIndex: 5,
      },
    ];
  };

  tooltipFormatter = () => {
    const maxValue = this.props.max;
    const self = this;
    return function (tooltip, x = this.x, value = this.value) {
      return `Step ${self.props.iters[this.x]}: <b>${Math.round(
        value * maxValue,
      )}</b>`;
    };
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

Heatmap.defaultProps = {
  name: 'Series',
  min: 0,
};

Heatmap.propTypes = {
  data: PropTypes.array,
  x: PropTypes.array,
  y: PropTypes.array,
  min: PropTypes.number,
  max: PropTypes.number,
  click: PropTypes.func,
  cursor: PropTypes.number,
  name: PropTypes.string,
  iters: PropTypes.array,
};

export default Heatmap;
