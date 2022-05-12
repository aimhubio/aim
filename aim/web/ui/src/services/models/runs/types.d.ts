import { IValidationPatterns } from 'components/kit/Input';
import { IMenuItem } from 'components/kit/Menu';

export type IRunTraceModel = {
  runHash: string;
  traceType: TraceType;
  isTraceBatchLoading: boolean;
  isTraceContextBatchLoading: boolean;
  menu: {
    title: string;
    items: IMenuItem[];
    activeItemKey: string;
    activeItemName: string;
    defaultActiveItemKey: string;
    availableKeys: string[];
  };
  runParams?: object;
  queryData: QueryData;
  batchRequestOptions: {
    trace: TraceRawDataItem;
    params: {};
  };
  config: IConfig;
  data: any;
  isApplyBtnDisabled: boolean;
};

export type TraceType =
  | 'distributions'
  | 'images'
  | 'audios'
  | 'texts'
  | 'videos'
  | 'figures'
  | 'metric';

/**
 * The context of info Raw data
 * It need to have | {} annotation as well, but it cause problems while working
 * Checking its an empty object like this Object.key(context).length > 0
 */
export type TraceContext = { [key: string]: string };

/**
 * Raw data coming from run detail's info api call
 */
export type TraceRawDataItem = {
  context: TraceContext;
  name: string;
};

/**
 * Distributions api response
 */
export interface DistributionsData extends TraceRawDataItem {
  record_range_total: [number, number];
  values: DistributionValue[];
  iters: number[];
}

/**
 * Images api response
 * @TODO make compatible to images data
 */
export interface ImagesData extends DistributionsData {
  context: object;
  index_range_total: [number, number];
  values: any;
}

/**
 * Texts api response
 * @TODO make compatible to texts data
 */
export interface TextsData extends ImagesData {
  values: { data: string; index: number }[][];
}

/**
 * Distributions api response value type
 */
export type DistributionValue = {
  bin_count: number;
  range: [number, number];
  data: {
    blob: Uint8Array;
  };
};

/**
 * Plotly api response
 */
export interface IPlotlyData extends TraceRawDataItem {
  record_range_total: [number, number];
  values: PlotlyValue[];
  iters: number[];
}

/**
 * Plotly api response value type
 */
export type IPlotlyValue = {
  data: {
    data: any[];
    layout: any;
  };
};
export interface TraceProcessedData extends DistributionValue {
  data: {
    blob: TraceProcessedValue;
  };
}

export type TraceProcessedValue = number[] | ArrayBuffer;

export type TraceResponseData = DistributionsData | ImagesData;

export type QueryData = {
  sliders: Record<string, [number, number]>;
  inputs: Record<string, number>;
  inputsValidations: Record<string, boolean>;
};

export type RangePanelItem = {
  sliderName: string;
  inputName: string;
  sliderTitle: string;
  inputTitle: string;
  sliderTitleTooltip: string;
  inputTitleTooltip: string;
  sliderType: 'single' | 'range'; // This type is same as SliderWithInput component sliderType prop type.
  inputValidationPatterns?: (...args: any) => IValidationPatterns;
  infoPropertyName?: string;
};

export type IConfig = {
  rangePanel: RangePanelItem[];
};
