import { BaseErrorType } from './engine/types';
/**
 * @class BaseError representing an Aim error object.
 *
 * Usage:
 *  <pre>
 *    new BaseError()
 *    new BaseError(message)
 *    new BaseError(message, detail)
 *  </pre>
 *
 * @param {string} message - error message
 * @param {Record<string, any>} detail - error details
 * @return {BaseError} - Aim error object
 */

class BaseError extends Error {
  detail: Record<string, any>;
  constructor(message?: string, detail: Record<string, any> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.detail = detail;
  }

  getError(): BaseErrorType {
    return {
      name: this.name,
      message: this.message,
      detail: this.detail,
    };
  }
}

export default BaseError;
