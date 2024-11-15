const ENDPOINTS = {
  PROJECTS: {
    BASE: '/projects',
    GET: '',
    GET_ACTIVITY: 'activity',
    GET_PARAMS: 'params',
  },

  RUNS: {
    BASE: '/runs',
    GET: '',
    SEARCH: 'search',
    ACTIVE: 'active',
  },

  EXPERIMENTS: {
    BASE: '/experiments',
    GET: '',
    CREATE: '',
    DELETE: '',
    SEARCH: 'search',
    GET_ACTIVITY: 'activity',
    GET_NOTE: 'note',
    CREATE_NOTE: 'note',
  },

  DASHBOARDS: {
    BASE: '/dashboards',
    GET: '',
    CREATE: '',
    SEARCH: 'search',
  },

  TAGS: {
    BASE: '/tags',
    GET: '',
    CREATE: '',
    UPDATE: '',
    DELETE: '',
  },
  RELEASE_NOTES: {
    BASE: 'https://api.github.com/repos/aimhubio/aim/releases',
    GET: '',
    GET_BY_TAG_NAME: 'tags',
  },
  AUTH: {
    BASE: 'auth',
    REFRESH: 'refresh',
  },
  BOARDS: {
    BASE: '/boards',
    GET: '',
    CREATE: '',
    UPDATE: '',
    DELETE: '',
    TEMPLATES: '/templates',
    RESET: '/reset',
  },
  REPORTS: {
    BASE: '/reports',
    GET: '',
    CREATE: '',
    UPDATE: '',
    DELETE: '',
  },
};

export default ENDPOINTS;
