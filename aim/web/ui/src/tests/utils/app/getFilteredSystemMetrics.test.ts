import { toEqual } from 'tests/utils';

import getFilteredSystemMetrics from 'utils/app/getFilteredSystemMetrics';

describe('[Filter and get system metrics from table columns data]', () => {
  it('correctly filtering and returning system metrics keys array', () => {
    let columns = [
      'Loss_type="mel_loss"',
      'Loss_type="duration_loss"',
      '__system__cpu',
      '__system__disk_percent',
      '__system__p_memory_percent',
      'preprocess_config.dataset',
    ];
    toEqual(getFilteredSystemMetrics(columns), [
      '__system__cpu',
      '__system__disk_percent',
      '__system__p_memory_percent',
    ]);
  });

  it('correctly filtering and returning empty array', () => {
    let columns = [
      'train_config.path.result_path',
      'train_config.step.save_step',
      'train_config.step.synth_step',
    ];
    toEqual(getFilteredSystemMetrics(columns), []);
  });

  it('correctly filtering and returning array without system metrics', () => {
    let columns = [
      'train_config.path.result_path',
      'train_config.step.save_step',
      'train_config.step.synth_step',
      '__system__cpu',
      '__system__disk_percent',
      '__system__p_memory_percent',
    ];
    toEqual(getFilteredSystemMetrics(columns, true), [
      'train_config.path.result_path',
      'train_config.step.save_step',
      'train_config.step.synth_step',
    ]);
  });
  it('correctly filtering and returning empty array', () => {
    let columns = [
      '__system__cpu',
      '__system__disk_percent',
      '__system__p_memory_percent',
    ];
    toEqual(getFilteredSystemMetrics(columns, true), []);
  });
});
