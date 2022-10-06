export type BaseErrorDetail = string | Record<string, any>;
interface BaseError extends Error {
  detail?: BaseErrorDetail;
}
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
 * @param {BaseErrorDetail} detail - error details
 * @return {BaseError} - Aim error object
 */
class BaseError extends Error {
  constructor(message?: string, detail?: BaseErrorDetail) {
    super(message);
    this.name = this.constructor.name;
    this.detail = detail;
  }
}

export default BaseError;
