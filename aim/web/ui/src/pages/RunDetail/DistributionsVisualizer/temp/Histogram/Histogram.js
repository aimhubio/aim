import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import histogram from 'highcharts/modules/histogram-bellcurve';

class Histogram extends Component {
  constructor(props) {
    super(props);

    let series = [
      {
        type: 'histogram',
        data: this.props.data,
        color: '#3E72E7',
        tooltip: {
          pointFormat:
            'Bin: <b>{point.x}</b> <br /> Frequency:  <b>{point.y}</b>',
        },
      },
    ];

    if (this.props.line) {
      series.push({
        type: 'line',
        data: this.props.line,
        color: 'rgb(28, 40, 82)',
        tooltip: {
          headerFormat: '',
          pointFormat: 'Frequency: <b>{point.y}</b>',
        },
        marker: {
          enabled: true,
          radius: 2,
          fillColor: '#3b5896',
          lineWidth: 1,
          lineColor: 'rgb(28, 40, 82)',
          symbol: 'circle',
        },
      });
    }

    this.state = {
      options: {
        chart: {
          marginTop: 70,
          marginBottom: 50,
          spacing: [10, 20, 10, 10],
          height: 250,
        },

        xAxis: {
          labels: {
            align: 'center',
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
          text: this.props.subtitle,
        },

        credits: {
          enabled: false,
        },

        legend: {
          enabled: false,
        },
        series: series,
        plotOptions: {
          series: {
            states: {
              inactive: {
                opacity: 1,
              },
            },
          },
        },
      },
    };

    this.chartRef = React.createRef();
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillMount() {
    histogram(Highcharts);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.chartRef.current.chart.update({
        series: [
          {
            data: this.props.data.data,
          },
          {
            line: this.props.data.line,
          },
        ],
      });
    }
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

Histogram.defaultProps = {
  subtitle: '',
};

Histogram.propTypes = {
  data: PropTypes.array,
  line: PropTypes.array,
  subtitle: PropTypes.string,
};

export default Histogram;
