import BaseError, { BaseErrorDetail } from '../BaseError';

interface PipelineError extends BaseError {
  source: string;
}
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
 * @param {BaseErrorDetail} detail - pipeline error details
 * @param {string} source - source of the pipeline error
 * @return {PipelineError} - pipeline error object
 */
class PipelineError extends BaseError {
  constructor(
    message?: string,
    detail?: BaseErrorDetail,
    source: string = 'unknown',
  ) {
    super(message, detail);
    this.source = source;
    this.name = this.constructor.name;
  }
}

export default PipelineError;
