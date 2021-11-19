import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import { version } from '../../package.json';

/**
 * remove query params from the url, since there can be sensitive data
 * @param url
 */
function removeUrlSensitiveDataPart(url: string) {
  return url.slice(0, url.indexOf('?'));
}

Sentry.init({
  dsn: 'https://815c55268c174d12949a09954999ee42@o1069909.ingest.sentry.io/6071123',
  integrations: [new Integrations.BrowserTracing()],
  environment: 'production',
  release: version,
  // @ts-ignore
  beforeSend(event: any): PromiseLike<Event | null> | Event | null {
    event.request.url = removeUrlSensitiveDataPart(event.request.url);
    // @TODO remove sensitive data parts from 'breadcrumb log and network request'
    // /runs?search=hash
    // /runs
    if (event.exception) {
      Sentry.showReportDialog({
        eventId: event.event_id,
        lang: 'en',
      });
    }
    return event;
  },
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
