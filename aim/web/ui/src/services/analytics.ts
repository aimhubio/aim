//@ts-nocheck
export const SEGMENT_DEMO_WRITE_KEY = 'Z5rtxFe3gJmZB8JD97c4rqQa9R0q4Gkn';
export const SEGMENT_WRITE_KEY = 'RrVqLHHD6WDXoFBkodO9KidodTtU92XO';
export function isDev() {
  return process.env.NODE_ENV === 'development';
}

let initialized = false;

const enabled = () => {
  return (
    (!isDev() && window.analytics !== false) || window.telemetry_enabled !== 0
  ); //!isDev() && cookies.getCookie(configs.USER_ANALYTICS_COOKIE_NAME) == 1;
};

const init = () => {
  if (initialized) return;
  if (
    window.location.hostname.indexOf('aimstack.io') !== -1 &&
    (window.location.hostname.indexOf('demo') !== -1 ||
      window.location.hostname.indexOf('play') !== -1)
  ) {
    window.analytics._writeKey = SEGMENT_DEMO_WRITE_KEY;
    window.analytics.load(SEGMENT_DEMO_WRITE_KEY);
  } else {
    window.analytics._writeKey = SEGMENT_WRITE_KEY;
    window.analytics.load(SEGMENT_WRITE_KEY);
  }
  window.analytics.identify();
  initialized = true;
};

const pageView = (pageName, pageCat = null) => {
  if (!enabled()) return;
  init();
  window.analytics.page(pageCat, pageName, {
    path: window.location.pathname,
    url: window.location.hostname,
    search: null,
    referrer: null,
    title: null,
  });
};

const trackEvent = (eventName: string, properties = {}) => {
  if (!enabled()) return;
  init();

  window.analytics.track(eventName, properties, {
    path: window.location.pathname,
    url: window.location.hostname,
    page: {
      path: null,
      search: null,
      referrer: null,
      title: null,
      url: null,
    },
  });
};

export { init, pageView, trackEvent };
