import { IValidationPatterns } from 'components/kit/Input';

import { QueryData } from './types';
import {
  processDistributionsData,
  processImagesData,
  processTextsData,
  processPlotlyData,
  processAudiosData,
} from './util';

type InputItem = {
  title: string;
  defaultValue: number;
  tooltip: string;
};

type SliderItem = {
  title: string;
  defaultValue: [number, number];
  tooltip: string;
  sliderType: 'single' | 'range'; // This type is same as SliderWithInput component sliderType prop type.
  infoPropertyName?: string;
};

type SettingItem = {
  dataProcessor: Function;
  sliders: Record<string, SliderItem>;
  inputs: Record<string, InputItem>;
  paramsToApi?: (queryData?: QueryData) => Record<string, unknown>;
  inputValidation?: (...args: any) => IValidationPatterns;
};

const settings: Record<string, SettingItem> = {
  distributions: {
    dataProcessor: processDistributionsData,
    sliders: {
      record_range: {
        defaultValue: [0, 50],
        title: 'Steps',
        tooltip: 'Training step. Increments every time track() is called',
        sliderType: 'range',
        infoPropertyName: 'step',
      },
    },
    inputs: {
      record_density: {
        defaultValue: 50,
        title: 'Steps',
        tooltip: 'Number of steps to display',
      },
    },
  },
  images: {
    dataProcessor: processImagesData,
    sliders: {
      record_range: {
        defaultValue: [0, 50],
        tooltip: 'Training step. Increments every time track() is called',
        title: 'Steps',
        sliderType: 'range',
        infoPropertyName: 'step',
      },
      index_range: {
        defaultValue: [0, 50],
        tooltip: 'Index in the list of images passed to track() call',
        title: 'Indices',
        sliderType: 'range',
        infoPropertyName: 'index',
      },
    },
    inputs: {
      record_density: {
        defaultValue: 50,
        title: 'Steps count',
        tooltip: 'Number of steps to display',
      },
      index_density: {
        defaultValue: 5,
        title: 'Indices count',
        tooltip: 'Number of images per step',
      },
    },
  },
  audios: {
    dataProcessor: processAudiosData,
    sliders: {
      record_range: {
        defaultValue: [0, 50],
        tooltip: 'Training step. Increments every time track() is called',
        title: 'Steps',
        sliderType: 'range',
        infoPropertyName: 'step',
      },
      index_range: {
        defaultValue: [0, 50],
        tooltip: 'Index in the list of audios passed to track() call',
        title: 'Indices',
        sliderType: 'range',
        infoPropertyName: 'index',
      },
    },
    inputs: {
      record_density: {
        defaultValue: 50,
        title: 'Steps count',
        tooltip: 'Number of steps to display',
      },
      index_density: {
        defaultValue: 5,
        title: 'Indices count',
        tooltip: 'Number of audios per step',
      },
    },
  },
  texts: {
    dataProcessor: processTextsData,
    sliders: {
      record_range: {
        defaultValue: [0, 50],
        tooltip: 'Training step. Increments every time track() is called',
        title: 'Steps',
        sliderType: 'range',
        infoPropertyName: 'step',
      },
      index_range: {
        defaultValue: [0, 50],
        tooltip: 'Index in the list of texts passed to track() call',
        title: 'Indices',
        sliderType: 'range',
        infoPropertyName: 'index',
      },
    },
    inputs: {
      record_density: {
        defaultValue: 50,
        title: 'Steps count',
        tooltip: 'Number of steps to display',
      },
      index_density: {
        defaultValue: 5,
        title: 'Indices count',
        tooltip: 'Number of texts per step',
      },
    },
  },
  figures: {
    dataProcessor: processPlotlyData,
    paramsToApi: (queryData?: QueryData) => {
      const record_step = queryData?.inputs?.record_range ?? -1;
      return record_step !== -1
        ? {
            record_step,
            record_density: 1,
          }
        : { record_density: 1 };
    },
    inputValidation: (min: number | string, max: number | string) => [
      {
        errorCondition: (value: string | number) => +value < min,
        errorText: `Value should be equal or greater then ${min}`,
      },
      {
        errorCondition: (value: string | number) => +value > max,
        errorText: `Value should be equal or smaller then ${max}`,
      },
    ],
    sliders: {
      record_range: {
        defaultValue: [0, 0],
        tooltip: 'Training step. Increments every time track() is called',
        title: 'Step',
        sliderType: 'single',
        infoPropertyName: 'step',
      },
    },
    inputs: {
      record_range: {
        defaultValue: -1,
        tooltip: 'Training step. To see figures tracked in the step.',
        title: 'Step',
      },
    },
  },
};

export default settings;
