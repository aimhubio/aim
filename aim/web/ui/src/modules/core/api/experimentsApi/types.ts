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
   * The attached runs of the experiment
   */
  run_count: number;
}
