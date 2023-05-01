import PipelineError from '../PipelineError';
import { PipelinePhasesEnum } from '../types';

/**
 * @class FetchingError representing a fetching phase error object.
 *
 * Usage:
 *  <pre>
 *    new FetchingError()
 *    new FetchingError(message)
 *    new FetchingError(message, detail)
 *  </pre>
 *
 * @param {string} message - fetching error message
 * @param {Record<string, any>} detail - fetching error details
 * @return {FetchingError} - fetching error object
 */
class FetchingError extends PipelineError {
  constructor(message?: string, detail: Record<string, any> = {}) {
    super(message, detail, PipelinePhasesEnum.Fetching);
    this.name = this.constructor.name;
  }
}

/**
 * @class DecodingError representing a decoding phase error object.
 *
 * Usage:
 *  <pre>
 *    new DecodingError()
 *    new DecodingError(message)
 *    new DecodingError(message, detail)
 *  </pre>
 *
 * @param {string} message - decoding error message
 * @param {Record<string, any>} detail - decoding error details
 * @return {DecodingError} - decoding error object
 */
class DecodingError extends PipelineError {
  constructor(message?: string, detail: Record<string, any> = {}) {
    super(message, detail, PipelinePhasesEnum.Decoding);
    this.name = this.constructor.name;
  }
}

export { FetchingError, DecodingError };
