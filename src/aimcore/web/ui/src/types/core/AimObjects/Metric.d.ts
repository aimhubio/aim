import { SequenceFullView } from './Sequence';
import { Params, RunProps } from './Run';

export interface MetricSearchRunView {
  params: Params;
  traces: Array<SequenceFullView>;
  props: RunProps;
}
