import { QueryData } from './types';
import {
  processDistributionsData,
  processImagesData,
  processTextsData,
  processPlotlyData,
  reformatArrayQueries,
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
};

type SettingItem = {
  dataProcessor: Function;
  sliders: Record<string, SliderItem>;
  inputs: Record<string, InputItem>;
  paramsToApi?: (queryData?: QueryData) => Record<string, unknown>;
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
      },
      index_range: {
        defaultValue: [0, 50],
        tooltip: 'Index in the list of images passed to track() call',
        title: 'Indices',
        sliderType: 'range',
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
  texts: {
    dataProcessor: processTextsData,
    sliders: {
      record_range: {
        defaultValue: [0, 50],
        tooltip: 'Training step. Increments every time track() is called',
        title: 'Steps',
        sliderType: 'range',
      },
      index_range: {
        defaultValue: [0, 50],
        tooltip: 'Index in the list of texts passed to track() call',
        title: 'Indices',
        sliderType: 'range',
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
      const record_range = queryData?.inputs?.record_range || 1;

      return {
        ...reformatArrayQueries({
          record_range: [record_range - 1, record_range],
        }),
        record_density: 1,
      };
    },
    sliders: {
      record_range: {
        defaultValue: [0, 0],
        tooltip: 'Training step. Increments every time track() is called',
        title: 'Step',
        sliderType: 'single',
      },
    },
    inputs: {
      record_range: {
        defaultValue: 1,
        tooltip: 'Training step. To see figures tracked in the step.',
        title: 'Step',
      },
    },
  },
};

export default settings;
