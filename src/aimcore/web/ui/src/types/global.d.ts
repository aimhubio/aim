interface GTAG {
  (command: string, target: string, params?: any): void;
}
declare global {
  const __DEV__: boolean;
  interface Window {
    gtag: GTAG;
    telemetry_enabled: number;
  }
}

export enum AppNameEnum {
  METRICS = 'metrics',
  FIGURES = 'figures',
  FIGURES3D = 'figures3d',
  AUDIOS = 'audios',
  TEXT = 'text',
}
