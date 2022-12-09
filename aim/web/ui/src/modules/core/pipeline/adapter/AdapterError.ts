import PipelineError from '../PipelineError';
import { PipelinePhasesEnum } from '../types';

/**
 * @class AdapterError representing an adapter phase error object.
 *
 * Usage:
 *  <pre>
 *    new AdapterError()
 *    new AdapterError(message)
 *    new AdapterError(message, detail)
 *  </pre>
 *
 * @param {string} message - adapter error message
 * @param {Record<string, any>} detail - adapter error details
 * @return {AdapterError} - adapter error object
 */
class AdapterError extends PipelineError {
  constructor(message?: string, detail: Record<string, any> = {}) {
    super(message, detail, PipelinePhasesEnum.Adopting);
    this.name = this.constructor.name;
  }
}

export default AdapterError;
