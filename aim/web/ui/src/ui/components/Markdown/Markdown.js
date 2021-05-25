import './Markdown.less';

import React from 'react';
import PropTypes from 'prop-types';
import MDReactComponent from 'markdown-react-js';

import { classNames } from '../../utils';

function Markdown(props) {
  const className = classNames({
    Markdown: true,
    [props.className]: !!props.className,
  });

  return (
    <div className={className}>
      <MDReactComponent text={props.children} />
    </div>
  );
}

Markdown.defaultProps = {
  className: '',
};

Markdown.propTypes = {
  className: PropTypes.string,
};

export default React.memo(Markdown);
