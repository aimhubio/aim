import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Histogram from './Histogram/Histogram';
import Heatmap from './Heatmap/Heatmap';

//@ TODO change this component to current style
class ExperimentDistributionCharts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      empty: true,
      key: Math.random(),
    };
  }

  componentDidMount() {
    this.computeHeatmap();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.computeHeatmap();
    }

    if (prevProps.name !== this.props.name) {
      this.computeHeatmap();
    }
  }

  computeHeatmap = () => {
    if (!this.props.data.length) {
      this.setState({
        empty: true,
      });
      return;
    }

    this.setState(
      {
        histogram: [],
        histogramLine: [],
        heatmapX: [],
        heatmapY: [],
        heatmapValMax: null,
        heatmapData: [],
        cursor: -1,
      },
      () => {
        const data = this.props.data;
        const bins = 20;

        let xMin = null;
        let xMax = null;
        let heatmapValMax = null;

        data.map((el) => {
          const y = el[1];

          if (xMin == null || y[0] < xMin) {
            xMin = y[0];
          }

          if (xMax == null || y[y.length - 1] > xMax) {
            xMax = y[y.length - 1];
          }
        });

        let heatmapDataMap = {};
        let heatmapData = [];
        let heatmapX = [];
        let heatmapY = [];

        const xLen = xMax - xMin;
        const binSize = xLen / bins;

        for (let i = 0; i < this.props.data.length; i++) {
          heatmapX.push(`${this.props.iters[i]}`);
        }
        for (let i = xMin; i <= xMax; i += binSize) {
          heatmapY.push(`${i}`);
        }

        data.map((iter, iterIndex) => {
          iter[0].map((el, elIndex) => {
            let yIndex = 0;
            for (let i = 1; i < heatmapY.length; i++) {
              yIndex = i;
              if (parseFloat(heatmapY[i]) > iter[1][elIndex]) {
                yIndex--;
                break;
              }
            }

            let itemKey = heatmapX.length * yIndex + iterIndex;

            if (heatmapDataMap[itemKey] === undefined) {
              heatmapDataMap[itemKey] = [];
            }
            heatmapDataMap[itemKey].push(el);
          });
        });

        for (let i = 0; i < heatmapX.length * heatmapY.length; i++) {
          if (heatmapDataMap[i] === undefined) {
            heatmapDataMap[i] = [0];
          }
        }

        for (let k in heatmapDataMap) {
          let x = Math.floor(k / heatmapX.length);
          let y = k % heatmapX.length;

          const cellVal = heatmapDataMap[k].reduce((a, b) => a + b);
          if (heatmapValMax == null || cellVal > heatmapValMax) {
            heatmapValMax = cellVal;
          }

          heatmapData.push([y, x, cellVal]);
        }

        this.setState({
          heatmapY,
          heatmapX,
          heatmapValMax,
          heatmapData,
          empty: false,
          key: this.props.name,
        });

        this.computeHistogram(0);
      },
    );
  };

  computeHistogram = (i) => {
    const data = this.props.data;

    if (i >= data.length || this.state.cursor === i) {
      return;
    }

    const histogram = data[i][0].map(function (elem, index) {
      return [data[i][1][index], elem];
    });

    const histogramLine = data[i][0].map(function (elem, index) {
      return [(data[i][1][index] + data[i][1][index + 1]) / 2, elem];
    });

    this.setState({
      histogram,
      histogramLine,
      cursor: i,
    });
  };

  handleClick = (e) => {
    this.computeHistogram(e.point.x);
  };

  render() {
    return (
      !this.state.empty && (
        <div
          key={this.state.key}
          className='Charts'
          style={{
            width: '100%',
          }}
        >
          <Histogram
            key={this.state.cursor}
            data={this.state.histogram}
            line={this.state.histogramLine}
            subtitle={`Step ${this.props.iters[this.state.cursor]}`}
          />
          <Heatmap
            x={this.state.heatmapX}
            y={this.state.heatmapY}
            max={this.state.heatmapValMax}
            data={this.state.heatmapData}
            cursor={this.state.cursor}
            name={'Frequency'}
            click={(e) => this.handleClick(e)}
            iters={this.props.iters}
          />
        </div>
      )
    );
  }
}

ExperimentDistributionCharts.propTypes = {
  data: PropTypes.array,
  name: PropTypes.string,
  iters: PropTypes.array,
};

export default ExperimentDistributionCharts;
