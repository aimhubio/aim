import { AlignmentOptionsEnum } from 'utils/d3';

export const METRICS_ALIGNMENT_LIST: {
  value: string;
  label: string;
  group?: string;
}[] = [
  {
    value: AlignmentOptionsEnum.STEP,
    label: 'Step',
  },
  {
    value: AlignmentOptionsEnum.EPOCH,
    label: 'Epoch',
  },
  {
    value: AlignmentOptionsEnum.RELATIVE_TIME,
    label: 'Relative Time',
  },
  {
    value: AlignmentOptionsEnum.ABSOLUTE_TIME,
    label: 'Absolute Time',
  },
];

export const DROPDOWN_LIST_HEIGHT = 253;
export const RANGE_DEBOUNCE_DELAY = 300;
