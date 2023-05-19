// @ts-nocheck

import * as React from 'react';

import { createRoot } from 'react-dom/client';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import Main from './Main';
import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.Fragment>
    <ErrorBoundary>
      <Main />
    </ErrorBoundary>
  </React.Fragment>,
);

// TODO: pass a function to log performance measurement results
reportWebVitals();
