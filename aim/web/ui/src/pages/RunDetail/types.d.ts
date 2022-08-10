import { TraceRawDataItem, TraceType } from 'services/models/runs/types';

import { IPinnedSequence } from 'types/services/models/projects/projectsModel';

export interface IRunDetailParamsTabProps {
  runParams: { [key: string]: any };
  isRunInfoLoading: boolean;
}

export interface IRunsProps {
  tableData: IRun<IMetricTrace | IParamTrace>[];
}
export interface IRunDetailMetricsAndSystemTabProps {
  runHash: string;
  runTraces: {
    metric: {
      name: string;
      context: {
        [key: string]: unknown;
      };
    }[];
  };
  runBatch: any;
  isSystem?: boolean;
  isRunBatchLoading: boolean;
}

export interface IRunBatch {
  key: string;
  context: { [key: string]: string };
  name: string;
  iters: number[];
  values: number[];
}

export interface IRunInfo {
  archived: boolean;
  creation_time: number;
  end_time: number;
  experiment: {
    id: string;
    name: string;
  };
  name: string;
  description: string;
  tags: any[];
  notes: number;
}

export interface IRunSelectPopoverContentProps {
  getRunsOfExperiment: (
    id: string,
    params?: { limit: number; offset?: string },
    isLoadMore?: boolean,
  ) => void;
  experimentsData: IRunSelectExperiment[];
  experimentId: string;
  runsOfExperiment: IRunSelectRun[];
  runInfo: any;
  isRunsOfExperimentLoading: boolean;
  isRunInfoLoading: boolean;
  isLoadMoreButtonShown: boolean;
  onRunsSelectToggle: () => void;
  dateNow: number;
}

export interface IRunSelectExperiment {
  archived: boolean;
  id: string;
  name: string;
  run_count: number;
}
export interface IRunSelectRun {
  creation_time: number;
  end_time: number;
  name: string;
  run_id: string;
}

export interface ITraceVisualizationContainerProps {
  runHash: string;
  traceInfo: Record<TraceType, TraceRawDataItem[]>;
  traceType: TraceType;
  runParams?: object;
}

export interface ITraceVisualizerProps {
  isLoading?: boolean;
  activeTraceContext?: string;
  data: any;
}

export interface IRunMetricCardProps {
  batch: IRunBatch;
  index: number;
  observer: IntersectionObserver | undefined;
  isPinned: boolean;
  togglePin: (metric: IPinnedSequence, isPinned: boolean) => void;
}

export interface IImagesVisualizerProps extends ITraceVisualizerProps {}

export interface IDistributionVisualizerProps extends ITraceVisualizerProps {}

export interface ITextsVisualizerProps extends ITraceVisualizerProps {}

export interface IPlotlyVisualizerProps extends ITraceVisualizerProps {}
