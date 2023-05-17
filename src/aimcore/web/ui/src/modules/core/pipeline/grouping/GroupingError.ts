import PipelineError from '../PipelineError';
import { PipelinePhasesEnum } from '../types';

/**
 * @class GroupingError representing a grouping phase error object.
 *
 * Usage:
 *  <pre>
 *    new GroupingError()
 *    new GroupingError(message)
 *    new GroupingError(message, detail)
 *  </pre>
 *
 * @param {string} message - grouping error message
 * @param {Record<string, any>} detail - grouping error details
 * @return {GroupingError} - grouping error object
 */
class GroupingError extends PipelineError {
  constructor(message?: string, detail: Record<string, any> = {}) {
    super(message, detail, PipelinePhasesEnum.Grouping);
    this.name = this.constructor.name;
  }
}

export default GroupingError;
