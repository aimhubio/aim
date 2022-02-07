import { ITrendlineOptions } from 'types/services/models/scatter/scatterAppModel';

export interface ITrendlineOptionsPopoverProps {
  trendlineOptions: ITrendlineOptions;
  onChangeTrendlineOptions: (options: Partial<ITrendlineOptions>) => void;
}
