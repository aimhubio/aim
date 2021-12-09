import { processDistributionsData, processImagesData } from './util';

type InputItem = {
  title: string;
  defaultValue: number;
  tooltip: string;
};

type SliderItem = {
  title: string;
  defaultValue: [number, number];
  tooltip: string;
};

type SettingItem = {
  dataProcessor: Function;
  sliders: Record<string, SliderItem>;
  inputs: Record<string, InputItem>;
};

const settings: Record<string, SettingItem> = {
  distributions: {
    dataProcessor: processDistributionsData,
    sliders: {
      record_range: {
        defaultValue: [0, 50],
        title: 'Steps',
        tooltip: 'Training step. Increments every time track() is called',
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
        tooltip: '',
        title: '',
      },
      index_range: {
        defaultValue: [0, 50],
        tooltip: '',
        title: '',
      },
    },
    inputs: {
      record_density: {
        defaultValue: 50,
        title: '',
        tooltip: '',
      },
      index_density: {
        defaultValue: 5,
        title: '',
        tooltip: '',
      },
    },
  },
};

export default settings;
