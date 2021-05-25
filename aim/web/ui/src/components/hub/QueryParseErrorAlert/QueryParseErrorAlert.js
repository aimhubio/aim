import './QueryParseErrorAlert.less';

import React from 'react';
import PropTypes from 'prop-types';

import UI from '../../../ui';

function QueryParseErrorAlert({ query, errorOffset }) {
  if (!query || errorOffset < 0 || errorOffset >= query.length) {
    return null;
  }

  return (
    <div className='QueryParseErrorAlert'>
      <div className='QueryParseErrorAlert__title'>
        <UI.Text type='negative'>Parse error:</UI.Text>
      </div>
      <div className='QueryParseErrorAlert__box'>
        {query.slice(0, errorOffset)}
        <div className='QueryParseErrorAlert__arrow'>
          <UI.Icon i='keyboard_arrow_up' scale={1.5} />
        </div>
        {errorOffset < query.length && query.slice(errorOffset)}
      </div>
      <div className='QueryParseErrorAlert__footer'>
        <UI.Icon i='info' scale={1.3} spacingRight />
        <UI.Text inline small>
          Aim Query Language is pythonic and fairly easy to get used to. If
          having issues, please refer to the{' '}
          <a
            className='link'
            href='https://github.com/aimhubio/aim#searching-experiments'
            target='_blank'
            rel='noopener noreferrer'
          >
            docs
          </a>{' '}
          for more examples or the detailed{' '}
          <a
            className='link'
            href='https://github.com/aimhubio/aim/wiki/Aim-Query-Language'
            target='_blank'
            rel='noopener noreferrer'
          >
            spec
          </a>
          .
        </UI.Text>
      </div>
    </div>
  );
}

QueryParseErrorAlert.defaultProps = {
  query: '',
  errorOffset: 0,
};

export default QueryParseErrorAlert;
