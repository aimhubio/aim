import { SequenceTypesUnion } from 'types/core/enums';
import { Context } from 'types/core/shared';

/**
 * type GetParamsQueryOptions
 * The request query options type of GET /projects/params
 */
export type GetParamsQueryOptions = {
  /**
   * Sequence: array of sequence names or one of 'metric' | 'distributions' | 'images' | 'figures' | 'audio' etc. .
   */
  sequence: SequenceTypesUnion | SequenceTypesUnion[];
  /**
   * Exclude 'params' from the response
   */
  exclude_params?: boolean;
};

/**
 * type GetProjectsResult
 * The response type of GET /projects
 */
export type GetProjectsResult = {
  /**
   * The name of project
   */
  name: string;
  /**
   * The path of project
   */
  path: string;
  /**
   * The description of project
   */
  description: string;
  /**
   * This flag indicates is analytics tracking enabled by `aim up` command or not
   */
  telemetry_enabled: string;
};

/**
 * type GetParamsResult
 * The response type of GET /projects/params
 * This data is used by autosuggestions etc.
 */
export type GetParamsResult = {
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
  metric?: Record<string, Array<Context>>;
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
  images?: Record<string, Array<Context>>;
  /**
   * Context of tracked texts sequences by passing name of sequence as`texts`
   * This generates by calling
   * ```python
   *    run.track([, , , aim.Text(...)], name="...", context = {"subset": "test"})
   * ```
   */
  texts?: Record<string, Array<Context>>;
  /**
   * Context of tracked figures sequences by passing name of sequence as`figures`
   * This generates by calling
   * ```python
   *    run.track([, , , aim.Figure(...)], name="...", context = {"subset": "test"})
   * ```
   */
  figures?: Record<string, Array<Context>>;
  /**
   * Context of tracked distributions sequences by passing name of sequence as`distributions`
   * This generates by calling
   * ```python
   *    run.track([, , , aim.Distribution(...)], name="...", context = {"subset": "test"})
   * ```
   */
  distributions?: Record<string, Array<Context>>;
  /**
   * Context of tracked audios sequences by passing name of sequence as`audios`
   * This generates by calling
   * ```python
   *    run.track([, , , aim.Audio(...)], name="...", context = {"subset": "test"})
   * ```
   */
  audios?: Record<string, Array<Context>>;
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
