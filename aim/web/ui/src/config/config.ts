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

const isDEVModeOn: boolean = process.env.NODE_ENV === 'development';

function getBasePath(isApiBasePath: boolean = true): string {
  if (globalScope.API_BASE_PATH === '{{ base_path }}') {
    return isApiBasePath ? '' : '/';
  }
  return `${globalScope.API_BASE_PATH}`;
}

let API_HOST: string = isDEVModeOn
  ? `http://127.0.0.1:43800${getBasePath()}/api`
  : `${getBasePath()}/api`;

function getAPIHost() {
  return API_HOST;
}

function setAPIBasePath(basePath: string) {
  globalScope.API_BASE_PATH = basePath;
  API_HOST = isDEVModeOn
    ? `http://127.0.0.1:43800${getBasePath()}/api`
    : `${getBasePath()}/api`;
}

export { isDEVModeOn, getBasePath, getAPIHost, setAPIBasePath };
