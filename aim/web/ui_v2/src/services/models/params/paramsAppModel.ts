import paramsService from 'services/api/params/paramsService';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { CurveEnum } from 'utils/d3';
import createModel from '../model';

const model = createModel<Partial<any>>({});

function getConfig() {
  return {
    grouping: {
      color: ['run.params.hparams.seed'],
      style: ['run.params.hparams.lr'],
      chart: ['run.params.hparams.lr'],
      // TODO refactor boolean value types objects into one
      reverseMode: {
        color: false,
        style: false,
        chart: false,
      },
      isApplied: {
        color: true,
        style: true,
        chart: true,
      },
      persistence: {
        color: false,
        style: false,
      },
      seed: {
        color: 10,
        style: 10,
      },
      paletteIndex: 0,
      selectOptions: [],
    },
    chart: {
      curveInterpolation: CurveEnum.Linear,
      isVisibleColorIndicator: false,
      focusedState: {
        key: null,
        xValue: null,
        yValue: null,
        active: false,
        chartIndex: null,
      },
    },
  };
}

function initialize() {
  model.init();
  model.setState({
    config: getConfig(),
  });
}

function getParamsData() {
  const { call, abort } = paramsService.getParamsData();
  return {
    call: () =>
      call().then((data: any) => {
        model.setState({
          data,
          highPlotData: data,
        });
      }),
    abort,
  };
}

function onColorIndicatorChange(): void {
  const configData: any = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.isVisibleColorIndicator =
      !configData.chart.isVisibleColorIndicator;
    model.setState({ config: configData });
  }
}

function onCurveInterpolationChange(): void {
  const configData: any = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.curveInterpolation =
      configData.chart.curveInterpolation === CurveEnum.Linear
        ? CurveEnum.MonotoneX
        : CurveEnum.Linear;
    model.setState({ config: configData });
  }
}

function onActivePointChange(
  activePoint: IActivePoint,
  focusedStateActive: boolean = false,
): void {
  const configData: any = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.focusedState = {
      active: !!focusedStateActive,
      key: activePoint.key,
      xValue: activePoint.xValue,
      yValue: activePoint.yValue,
      chartIndex: activePoint.chartIndex,
    };
    model.setState({ config: configData });
  }
}

const metricAppModel = {
  ...model,
  initialize,
  getParamsData,
  onColorIndicatorChange,
  onCurveInterpolationChange,
  onActivePointChange,
};

export default metricAppModel;
