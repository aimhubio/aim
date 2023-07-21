//@ts-nocheck
const isDev = process.env.NODE_ENV === 'development';

const enabled = () => {
  return !isDev && window.gtag;
};

const pageView = (pageName) => {
  if (!enabled()) return;
  window.gtag('event', 'page_view', {
    page_title: pageName,
    page_path: window.location.pathname,
    page_location: window.location.href,
  });
};

const trackEvent = (eventName: string, properties = {}) => {
  if (!enabled()) return;
  window.gtag('event', eventName, properties);
};

export { pageView, trackEvent };
