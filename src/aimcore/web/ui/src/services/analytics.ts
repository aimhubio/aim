const isDev = process.env.NODE_ENV === 'development';

const enabled = () =>
  !isDev && window.telemetry_enabled === 1 && window.gtag !== undefined;

const pageView = (pageName: string) => {
  if (enabled()) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_path: window.location.pathname,
      page_location: window.location.href,
    });
  }
};

const trackEvent = (
  eventName: string,
  properties:
    | {
        event_category: string;
        event_label: string;
        [key: string]: string;
      }
    | {} = {},
) => {
  if (enabled()) {
    window.gtag('event', eventName, properties);
  }
};

export { pageView, trackEvent };
