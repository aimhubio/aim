import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IColorPopoverAdvancedProps {
  persistence: boolean;
  onPersistenceChange: IMetricProps['onGroupingPersistenceChange'];
  onPaletteChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
