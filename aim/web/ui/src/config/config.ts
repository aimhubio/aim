interface GlobalScope extends Window {
  API_BASE_PATH?: string;
}

let globalScope: GlobalScope;

try {
  globalScope = window;
} catch (ex) {
  /* eslint-disable-next-line no-restricted-globals */
  globalScope = self;
}

export const isDEVModeOn: boolean = process.env.NODE_ENV === 'development';

function getAPIBasePath() {
  if (globalScope.API_BASE_PATH === '{{ base_path }}') {
    return '';
  }
  return globalScope.API_BASE_PATH;
}

let API_HOST: string = isDEVModeOn
  ? `http://127.0.0.1:43800${getAPIBasePath()}/api`
  : `${getAPIBasePath()}/api`;

export function getAPIHost() {
  return API_HOST;
}

export function setAPIBasePath(basePath: string) {
  globalScope.API_BASE_PATH = basePath;
  API_HOST = isDEVModeOn
    ? `http://127.0.0.1:43800${getAPIBasePath()}/api`
    : `${getAPIBasePath()}/api`;
}
