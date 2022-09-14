import BaseError, { BaseErrorDetail } from '../BaseError';

class PipelineError extends BaseError {
  private source: string = 'unknown';
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
