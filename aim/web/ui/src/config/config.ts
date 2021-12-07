let globalScope;

try {
  globalScope = window;
} catch (ex) {
  /* eslint-disable-next-line no-restricted-globals */
  globalScope = self;
}

export const isDEVModeOn: boolean = process.env.NODE_ENV === 'development';

export const API_HOST: string = isDEVModeOn
  ? `http://127.0.0.1:43800${(window as any).API_BASE_PATH}/api`
  : `${globalScope.location.protocol}//${globalScope.location.hostname}:${
      globalScope.location.port
    }${(window as any).API_BASE_PATH}/api`;
