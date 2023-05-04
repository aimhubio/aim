// @ts-nocheck

import * as React from 'react';

import { createRoot } from 'react-dom/client';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import App from './App';
import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.Fragment>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.Fragment>,
);

// TODO: pass a function to log performance measurement results
reportWebVitals();
