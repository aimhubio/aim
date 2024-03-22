import { version } from '../../package.json';

interface GlobalScope extends Window {
  API_BASE_PATH?: string;
  API_AUTH_TOKEN?: string;
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

function setAPIAuthToken(authToken: string) {
  globalScope.API_AUTH_TOKEN = authToken;
}

function getAPIAuthToken() {
  return `${globalScope.API_AUTH_TOKEN}`;
}

export const AIM_VERSION = version;

const PATHS_TO_SHOW_CACHE_BANNERS = ['notebook', 'aim-sage'];

export function checkIsBasePathInCachedEnv(basePath: string) {
  const split_paths = basePath.split('/');
  const parsed_path = split_paths[split_paths.length - 1];

  return PATHS_TO_SHOW_CACHE_BANNERS.includes(parsed_path);
}

export {
  isDEVModeOn,
  getBasePath,
  getAPIHost,
  setAPIBasePath,
  setAPIAuthToken,
  getAPIAuthToken,
};
