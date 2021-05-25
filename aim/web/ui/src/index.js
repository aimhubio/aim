import 'normalize.css';
import './index.less';
import 'react-circular-progressbar/dist/styles.css';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import store from './store';
require('define').noConflict();

ReactDOM.render(
  <Provider store={store}>
    <App store={store} />
  </Provider>,
  document.getElementById('root'),
);

serviceWorker.unregister();
