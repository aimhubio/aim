import { BaseErrorDetail } from '../../BaseError';
import PipelineError from '../PipelineError';
import { PipelinePhasesEnum } from '../types';

class GroupingError extends PipelineError {
  constructor(message?: string, detail?: BaseErrorDetail) {
    super(message, detail, PipelinePhasesEnum.Grouping);
    this.name = this.constructor.name;
  }
}

export default GroupingError;
