export const isDEVModeOn: boolean = process.env.NODE_ENV === 'development';

export const API_HOST: string = isDEVModeOn
  ? 'http://127.0.0.1:43800/api'
  : `http://${window.location.hostname}:${window.location.port}/api`;
