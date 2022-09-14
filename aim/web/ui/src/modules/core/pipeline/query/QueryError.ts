import { BaseErrorDetail } from '../../BaseError';
import PipelineError from '../PipelineError';
import { PipelinePhasesEnum } from '../types';

class FetchingError extends PipelineError {
  constructor(message?: string, detail?: BaseErrorDetail) {
    super(message, detail, PipelinePhasesEnum.Fetching);
    this.name = this.constructor.name;
  }
}

class DecodingError extends PipelineError {
  constructor(message?: string, detail?: BaseErrorDetail) {
    super(message, detail, PipelinePhasesEnum.Decoding);
    this.name = this.constructor.name;
  }
}

export { FetchingError, DecodingError };
