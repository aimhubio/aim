import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto';

import App from './App';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root'),
);

// TODO: pass a function to log performance measurement results
reportWebVitals();
