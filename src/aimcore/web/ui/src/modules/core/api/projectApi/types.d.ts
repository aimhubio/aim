import { SequenceType, SequenceTypeUnion } from 'types/core/enums';
import { Context } from 'types/core/shared';

/**
 * type GetProjectsInfoResult
 * The response type of GET /projects/info
 * This data is used by autosuggestions etc.
 */
export type GetProjectsInfoResult = {
  sequences: GetProjectsInfoSequencesResult;
};

export type GetProjectsInfoSequencesResult = {
  /**
   * Tracked params for all runs
   * ```python
   *   run["hparams"] = {
   *     "batch_size": 16
   *     ...
   *   }
   * ```
   * This record includes high level params of run, system defined params like __system_params, environment variables etc.
   */
  params?: Record<string, any>;
  /**
   * Context of tracked metrics sequences by passing name of sequence as`metric`
   * This generates by calling
   * ```python
   *    run.track(1, name="metric", context = {"subset": "val"})
   * ```
   */
  [SequenceType.Metric]?: Record<string, Array<Context>>;
  /**
   * Context of tracked images sequences by passing name of sequence as`images`
   * This generates by calling
   * ```python
   *    run.track([, , , aim.Image(...)], name="labels", context = {"subset": "test"})
   *    run.track([, , , aim.Image(...)], , context = {"subset": "val"})
   * ```
   * i.e. {labels: [{"subset": "test"}], images: , [{"subset": "val"}]}
   * Note: Examples of records for the rest of sequences will follow to this example
   */
  [SequenceType.Image]?: Record<string, Array<Context>>;
  /**
   * Context of tracked texts sequences by passing name of sequence as`texts`
   * This generates by calling
   * ```python
   *    run.track([, , , aim.Text(...)], name="...", context = {"subset": "test"})
   * ```
   */
  [SequenceType.Text]?: Record<string, Array<Context>>;
  /**
   * Context of tracked figures sequences by passing name of sequence as`figures`
   * This generates by calling
   * ```python
   *    run.track([, , , aim.Figure(...)], name="...", context = {"subset": "test"})
   * ```
   */
  [SequenceType.Figure]?: Record<string, Array<Context>>;
  /**
   * Context of tracked distributions sequences by passing name of sequence as`distributions`
   * This generates by calling
   * ```python
   *    run.track([, , , aim.Distribution(...)], name="...", context = {"subset": "test"})
   * ```
   */
  [SequenceType.Distribution]?: Record<string, Array<Context>>;
  /**
   * Context of tracked audios sequences by passing name of sequence as`audios`
   * This generates by calling
   * ```python
   *    run.track([, , , aim.Audio(...)], name="...", context = {"subset": "test"})
   * ```
   */
  [SequenceType.Audio]?: Record<string, Array<Context>>;
  /**
   * Context of tracked figures3d sequences by passing name of sequence as`audios`
   * This generates by calling
   * ```python
   *    run.track([, , , aim.Figure3D(...)], name="...", context = {"subset": "test"})
   * ```
   */
  [SequenceType.Figure3d]?: Record<string, Array<Context>>;
};

/**
 * type GetProjectContributionsResult
 * The response type of GET /projects/activity
 * This data is used by autosuggestions etc.
 */
export type GetProjectContributionsResult = {
  /**
   * Total number of experiments in a single repo/storage/project (.aim directory)
   */
  num_experiments: number;
  /**
   * Total number of archived runs in a single repo/storage/project (.aim directory)
   */
  num_archived_runs: number;
  /**
   * Total number of runs in a single repo/storage/project (.aim directory)
   */
  num_runs: number;
  /**
   *  Number of active runs in a single repo/storage/project (.aim directory)
   */
  num_active_runs: number;
  /**
   * Activity distribution by datetime (creating run, tracking etc.)
   * This data is used by the activity heatmap of main dashboard of UI
   */
  activity_map: Record<string, number>;
};

export type PackagesListType = Record<
  string,
  {
    /**
     * The sequences list of package
     * i.e. ['asp.Metric', 'asp.Distribution', 'asp.Image', 'asp.Figure', 'asp.Audio', 'asp.Figure3D']
     */
    sequences: string[];
    /**
     * The containers list of package
     * i.e. ['asp.Run']
     */
    containers: string[];
    /**
     * The actions list of package
     * i.e. TODO: add example
     */
    actions: string[];
    /**
     * The boards list of package
     * i.e. TODO: add example
     */
    boards: string[];
  }
>;

/**
 * type GetProjectsInfoQueryOptions
 * The request query options type of GET /projects/info
 */
export type GetProjectsInfoQueryOptions = {
  /**
   * Sequence: array of sequence types
   * i.e. ['asp.Metric', 'asp.TextSequence', 'asp.ImageSequence', 'asp.AudioSequence' etc.]
   */
  sequence: SequenceTypeUnion[];
  /**
   * include tracked attributes/params too (False by default)
   */
  params?: boolean;
};
