export function formatSystemMetricName(metric: string): string {
  let name = metric;

  switch (name) {
    case '__system__cpu':
      name = 'CPU (%)';
      break;
    case '__system__p_memory_percent':
      name = 'Process Memory (%)';
      break;
    case '__system__memory_percent':
      name = 'Memory (%)';
      break;
    case '__system__disk_percent':
      name = 'Disk (%)';
      break;
    case '__system__gpu':
      name = 'GPU (%)';
      break;
    case '__system__gpu_memory_percent':
      name = 'GPU Memory (%)';
      break;
    case '__system__gpu_power_watts':
      name = 'GPU Power (W)';
      break;
    case '__system__gpu_temp':
      name = 'GPU Temp (°C)';
      break;
  }

  return name;
}
