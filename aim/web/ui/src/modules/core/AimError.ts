import { AimErrorType } from './engine/types';
/**
 * @class AimError representing an Aim error object.
 *
 * Usage:
 *  <pre>
 *    new AimError()
 *    new AimError(message)
 *    new AimError(message, detail)
 *  </pre>
 *
 * @param {string} message - error message
 * @param {Record<string, any>} detail - error details
 * @return {AimError} - Aim error object
 */

class AimError extends Error {
  detail: Record<string, any>;
  constructor(message?: string, detail: Record<string, any> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.detail = detail;
  }

  getError(): AimErrorType {
    return {
      name: this.name,
      message: this.message,
      detail: this.detail,
    };
  }
}

export default AimError;
