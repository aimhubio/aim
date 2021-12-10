import { IMenuItem } from 'components/kit/Menu';

export type IRunTraceModel = {
  runHash: string;
  traceType: TraceType;
  isTraceBatchLoading: boolean;
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
};

export type TraceType =
  | 'distributions'
  | 'images'
  | 'audios'
  | 'texts'
  | 'videos'
  | 'plotly';

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
  record_range: [number, number];
  values: DistributionValue[];
  iters: number[];
}

/**
 * Distributions api response
 * @TODO make compatible to images data
 */
export interface ImagesData extends DistributionsData {
  context: object;
  index_range: [number, number];
  values: any;
}

/**
 * Distributions api response value type
 */
export type DistributionValue = {
  bin_count: number;
  range: [number, number];
  data: {
    blob: Float64Array;
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
};

type RangePanelItem = {
  sliderName: string;
  inputName: string;
  sliderTitle: string;
  inputTitle: string;
  sliderTitleTooltip: string;
  inputTitleTooltip: string;
};
export type IConfig = {
  rangePanel: RangePanelItem[];
};
