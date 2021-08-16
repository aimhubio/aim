import { IAggregation } from 'types/services/models/metrics/metricsAppModel';

export interface IAggregationPopoverProps {
  aggregation: IAggregation;
  onChange: (aggregation: Partial<IAggregation>) => void;
}
