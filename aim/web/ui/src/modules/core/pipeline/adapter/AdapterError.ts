import { BaseErrorDetail } from '../../BaseError';
import PipelineError from '../PipelineError';
import { PipelinePhasesEnum } from '../types';

class AdapterError extends PipelineError {
  constructor(message?: string, detail?: BaseErrorDetail) {
    super(message, detail, PipelinePhasesEnum.Adopting);
    this.name = this.constructor.name;
  }
}

export default AdapterError;
