import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as histogram from 'highcharts/modules/histogram-bellcurve';

class Histogram extends Component {
  constructor(props) {
    super(props);

    let series = [
      {
        type: 'histogram',
        data: this.props.data,
      },
    ];

    if (this.props.line) {
      series.push({
        type: 'line',
        data: this.props.line,
      });
    }

    this.state = {
      options: {
        chart: {
          spacing: [20, 20, 20, 10],
          height: 350,
        },

        xAxis: {
          labels: {
            align: 'center',
          },
          title: {
            enabled: false,
          },
        },

        yAxis: {
          title: {
            enabled: false,
          },
          tickWidth: 1,
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

        series: series,

        plotOptions: {
          line: {
            marker: {
              radius: 3,
            },
          },
        },
      },
    };

    this.chartRef = React.createRef();
    histogram(Highcharts);
  }

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

Histogram.propTypes = {
  data: PropTypes.array,
  line: PropTypes.array,
};

export default Histogram;
