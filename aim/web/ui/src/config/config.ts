let globalScope;

try {
  globalScope = window;
} catch (ex) {
  /* eslint-disable-next-line no-restricted-globals */
  globalScope = self;
}

export const isDEVModeOn: boolean = process.env.NODE_ENV === 'development';

export const API_HOST: string = isDEVModeOn
  ? 'http://127.0.0.1:43800/api'
  : `http://${globalScope.location.hostname}:${globalScope.location.port}/api`;
