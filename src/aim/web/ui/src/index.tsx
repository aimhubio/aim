import React from 'react';
import ReactDOM from 'react-dom';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.Fragment>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.Fragment>,
  document.getElementById('root'),
);

// TODO: pass a function to log performance measurement results
reportWebVitals();
