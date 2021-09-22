import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IBookmarkFormProps {
  open: boolean;
  onClose: () => void;
  onBookmarkCreate: IMetricProps['onBookmarkCreate'];
}

export interface IBookmarkFormState {
  name: string;
  description: string;
}
