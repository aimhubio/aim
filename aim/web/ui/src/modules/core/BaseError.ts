export type BaseErrorDetail = string | Record<string, any>;

class BaseError extends Error {
  private detail?: BaseErrorDetail;
  constructor(message?: string, detail?: BaseErrorDetail) {
    super(message);
    this.name = this.constructor.name;
    this.detail = detail;
  }
}

export default BaseError;
