import AimError from '../AimError';
import { PipelineErrorType } from '../engine/types';

/**
 * @class PipelineError representing a pipeline phase error object.
 *
 * Usage:
 *  <pre>
 *    new PipelineError()
 *    new PipelineError(message)
 *    new PipelineError(message, detail)
 *    new PipelineError(message, detail, source)
 *  </pre>
 *
 * @param {string} message - pipeline error message
 * @param {Record<string, any>} detail - pipeline error details
 * @param {string} source - source of the pipeline error
 * @return {PipelineError} - pipeline error object
 */
class PipelineError extends AimError {
  source: string;
  constructor(
    message?: string,
    detail?: Record<string, any>,
    source: string = 'unknown',
  ) {
    super(message, detail);
    this.source = source;
    this.name = this.constructor.name;
  }

  getError(): PipelineErrorType {
    return {
      name: this.name,
      message: this.message,
      detail: this.detail,
      source: this.source,
    };
  }
}

export default PipelineError;
