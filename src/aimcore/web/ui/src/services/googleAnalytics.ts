const isDev = process.env.NODE_ENV === 'development';

const enabled = () => {
  if (!isDev && window.gtag !== undefined) {
    return true;
  } else {
    console.warn('Google Analytics is not enabled.');
    return false;
  }
};

const pageView = (pageName: string) => {
  if (enabled()) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_path: window.location.pathname,
      page_location: window.location.href,
    });
  }
};

const trackEvent = (eventName: string, properties = {}) => {
  if (enabled()) {
    window.gtag('event', eventName, properties);
  }
};

export { pageView, trackEvent };
