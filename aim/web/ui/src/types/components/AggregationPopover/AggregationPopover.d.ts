import { IAggregationConfig } from 'types/services/models/metrics/metricsAppModel';

export interface IAggregationPopoverProps {
  aggregationConfig: IAggregationConfig;
  onChange: (aggregationConfig: Partial<IAggregationConfig>) => void;
}
