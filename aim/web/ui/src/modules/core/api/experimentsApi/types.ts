/**
 * interface IExperimentData
 * the experiment data interface
 */
export interface IExperimentData {
  /**
   * The id of the experiment
   */
  id: string;
  /**
   * The name of the experiment
   */
  name: string;
  /**
   * is the experiment archived
   */
  archived: boolean;
  /**
   * the description of the experiment
   */
  description: string;
  /**
   * The attached runs of the experiment
   */
  run_count: number;
  /**
   * The date the experiment have been created at in milliseconds
   */
  creation_time: number;
}

/**
 * type GetExperimentContributionsResult
 * The response type of GET /experiments/{exp_id}/activity

 */
export type GetExperimentContributionsResult = {
  /**
   * Total number of archived runs in a single experiment
   */
  num_archived_runs: number;
  /**
   * Total number of runs in a single experiment
   */
  num_runs: number;
  /**
   *  Number of active runs in a single experiment
   */
  num_active_runs: number;
  /**
   * Activity distribution by datetime (creating run, tracking etc.)
   * This data is used by the activity heatmap of experiment page of UI
   */
  activity_map: Record<string, number>;
};

export type GetExperimentNoteResult = ExperimentNote[];

/**
 * type ExperimentRunsSearchQueryParams
 */
export type ExperimentRunsSearchQueryParams = {
  /**
   * the offset of the runs
   */
  offset?: number;
  /**
   * the limit of the runs per call
   */
  limit?: number;
};

export type ExperimentRun = {
  run_id: string;
  name: string;
  creation_time: number;
  end_time: number;
  archived: boolean;
};

export type ExperimentRunsSearchResult = {
  /**
   * the experiment id
   */
  id: number;
  /**
   * the limit of the runs per call
   */
  runs?: ExperimentRun;
};

export type ExperimentNote = {
  /**
   * the experiment note id
   */
  id: number;
  /**
   * the experiment note content
   */
  content: string;
  /**
   * the experiment note created at
   */
  created_at: string;
  /**
   * the experiment note updated at
   */
  updated_at: string;
};

export type UpdateExperimentByIdReqBodyType = {
  /**
   * the experiment name
   */
  name?: string;
  /**
   * the experiment description
   */
  description?: string;
  /**
   * is the experiment archived
   */
  archived?: boolean;
};
