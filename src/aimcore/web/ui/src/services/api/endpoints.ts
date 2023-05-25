const ENDPOINTS = {
  DATA: {
    BASE: '/data',
    GET: '',
    FETCH: 'fetch',
    GET_GROUPED_SEQUENCES: 'grouped-sequences',
  },

  PROJECTS: {
    BASE: '/projects',
    GET: '',
    GET_ACTIVITY: 'activity',
    GET_PARAMS: 'params',
    GET_PACKAGES: 'packages',
    GET_INFO: 'info',
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
  BOARDS: {
    BASE: '/boards',
    GET: '',
    CREATE: '',
    UPDATE: '',
    DELETE: '',
    TEMPLATES: '/templates',
    RESET: '/reset',
  },
};

export default ENDPOINTS;
