import { systemMetricsDictType } from 'types/utils/formatSystemMetricName';

export const systemMetricsDict: systemMetricsDictType = {
  __system__cpu: 'CPU (%)',
  __system__p_memory_percent: 'Process Memory (%)',
  __system__memory_percent: 'Memory (%)',
  __system__disk_percent: 'Disk (%)',
  __system__gpu: 'GPU (%)',
  __system__gpu_memory_percent: 'GPU Memory (%)',
  __system__gpu_power_watts: 'GPU Power (W)',
  __system__gpu_temp: 'GPU Temperature (°C)',
};
