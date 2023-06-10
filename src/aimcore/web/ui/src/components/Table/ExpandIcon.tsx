// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import cn from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

/**
 * default ExpandIcon for BaseTable
 */
class ExpandIcon extends React.PureComponent {
  constructor(props) {
    super(props);

    this._handleClick = this._handleClick.bind(this);
  }

  render() {
    const { expandable, expanded, indentSize, depth, onExpand, ...rest } =
      this.props;
    if (!expandable && indentSize === 0) return null;

    const cls = cn('BaseTable__expand-icon', {
      'BaseTable__expand-icon--expanded': expanded,
    });
    return (
      <ErrorBoundary>
        <div
          {...rest}
          className={cls}
          onClick={expandable && onExpand ? this._handleClick : null}
          style={{
            fontFamily: 'initial',
            cursor: 'pointer',
            userSelect: 'none',
            width: '1em',
            minWidth: '1em',
            height: '1em',
            lineHeight: '1em',
            fontSize: '1em',
            textAlign: 'center',
            transition: 'transform 0.15s ease-out',
            transform: `rotate(${expandable && expanded ? 90 : 0}deg)`,
            marginLeft: depth * indentSize,
          }}
        >
          {expandable && '\u25B8'}
        </div>
      </ErrorBoundary>
    );
  }

  _handleClick(e) {
    e.stopPropagation();
    e.preventDefault();
    const { onExpand, expanded } = this.props;
    onExpand(!expanded);
  }
}

export default ExpandIcon;
