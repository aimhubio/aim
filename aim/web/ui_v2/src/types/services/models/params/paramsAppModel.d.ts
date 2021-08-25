import { IParamTrace, IRun } from 'types/services/models/metrics/runModel';

export interface IParam {
  run: IRun<IParamTrace>;
  color: string;
  key: string;
  dasharray: string;
}
interface IParamsAppConfig {
  grouping: {
    color: string[];
    style: string[];
    chart: string[];
    reverseMode: {
      color: boolean;
      style: boolean;
      chart: boolean;
    };
    isApplied: {
      color: boolean;
      style: boolean;
      chart: boolean;
    };
    persistence: {
      color: boolean;
      style: boolean;
    };
    seed: {
      color: number;
      style: number;
    };
    paletteIndex: number;
    selectOptions: GroupingSelectOptionType[];
  };
  chart: {
    curveInterpolation: CurveEnum;
    isVisibleColorIndicator: boolean;
    focusedState: IFocusedState;
  };
  select: {
    params: ISelectMetricsOption[];
    query: string;
  };
  onParamsSelectChange: (data) => void;
}
