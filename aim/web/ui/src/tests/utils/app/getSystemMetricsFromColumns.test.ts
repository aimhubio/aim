import { toEqual } from 'tests/utils';

import getSystemMetricsFromColumns from 'utils/app/getSystemMetricsFromColumns';

describe('[Filter and get system metrics from table columns data]', () => {
  it('correctly filtering and returning system metrics keys array', () => {
    let columns = [
      {
        key: 'Loss_type="mel_loss"',
        content: {
          key: null,
          ref: null,
          props: {
            size: 'small',
            color: '#3E72E7',
            label: 'type="mel_loss"',
          },
        },
        topHeader: 'Loss',
        pin: null,
        isHidden: false,
      },
      {
        key: 'Loss_type="duration_loss"',
        content: {
          key: null,
          ref: null,
          props: {
            size: 'small',
            color: '#3E72E7',
            label: 'type="duration_loss"',
          },
        },
        topHeader: 'Loss',
        pin: null,
        isHidden: false,
      },
      {
        key: '__system__cpu',
        content: {
          type: 'span',
          key: null,
          ref: null,
          props: {
            children: 'CPU (%)',
          },
        },
        topHeader: 'System Metrics',
        pin: null,
        isHidden: true,
      },
      {
        key: '__system__disk_percent',
        content: {
          type: 'span',
          key: null,
          ref: null,
          props: {
            children: 'Disk (%)',
          },
        },
        topHeader: 'System Metrics',
        pin: null,
        isHidden: true,
      },
      {
        key: '__system__p_memory_percent',
        content: {
          type: 'span',
          key: null,
          ref: null,
          props: {
            children: 'Process Memory (%)',
          },
        },
        topHeader: 'System Metrics',
        pin: null,
        isHidden: true,
      },
      {
        key: 'preprocess_config.dataset',
        content: {
          type: 'span',
          key: null,
          ref: null,
          props: {
            children: 'preprocess_config.dataset',
          },
        },
        topHeader: 'Params',
        pin: null,
        isHidden: false,
      },
    ];
    toEqual(
      ['__system__cpu', '__system__disk_percent', '__system__p_memory_percent'],
      getSystemMetricsFromColumns(columns),
    );
  });

  it('correctly filtering and returning empty array', () => {
    let columns = [
      {
        key: 'train_config.path.result_path',
        content: {
          type: 'span',
          key: null,
          ref: null,
          props: {
            children: 'train_config.path.result_path',
          },
        },
        topHeader: 'Params',
        pin: null,
        isHidden: false,
      },
      {
        key: 'train_config.step.save_step',
        content: {
          type: 'span',
          key: null,
          ref: null,
          props: {
            children: 'train_config.step.save_step',
          },
        },
        topHeader: 'Params',
        pin: null,
        isHidden: false,
      },
      {
        key: 'train_config.step.synth_step',
        content: {
          type: 'span',
          key: null,
          ref: null,
          props: {
            children: 'train_config.step.synth_step',
          },
        },
        topHeader: 'Params',
        pin: null,
        isHidden: false,
      },
    ];
    toEqual([], getSystemMetricsFromColumns(columns));
  });
});
