//@ts-nocheck
export const SEGMENT_DEMO_WRITE_KEY = 'Rj1I4AisLSvsvAnPW7OqkoYBUTXJRBHK';
export const SEGMENT_WRITE_KEY = 'LBnAonwto541z4Dn4ntGJScCsYNRdIC3';
export function isDev() {
  return window.app?.env === 'dev';
}

const enabled = () => {
  return !isDev() && window.analytics !== false; //!isDev() && cookies.getCookie(configs.USER_ANALYTICS_COOKIE_NAME) == 1;
};

const init = () => {
  if (!enabled()) {
    return;
  }

  if (
    window.location.hostname.indexOf('aimstack.io') !== -1 &&
    (window.location.hostname.indexOf('demo') !== -1 ||
      window.location.hostname.indexOf('play') !== -1)
  ) {
    window.analytics.load(SEGMENT_DEMO_WRITE_KEY);
  } else {
    window.analytics.load(SEGMENT_WRITE_KEY);
  }
};
const pageView = (pageName, pageCat = null) => {
  if (!enabled()) {
    return;
  }
  window.analytics.page(pageCat, pageName, {
    path: window.location.pathname,
    url: window.location.hostname,
    search: null,
    referrer: null,
    title: null,
  });
};

const trackEvent = (eventName: string, properties = {}) => {
  if (!enabled()) {
    return;
  }
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
