import './Tooltip.less';

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import UI from '../..';

const offset = 10;

function Tooltip(props) {
  let portalRef = useRef(document.createElement('div'));
  let containerRef = useRef();
  let tooltipRef = useRef();
  let timerId = useRef();

  let [visible, setVisible] = useState(false);
  let [position, setPosition] = useState({});

  function toggleVisibility(show) {
    clearTimeout(timerId.current);
    if (show && !visible) {
      if (props.delay > 0) {
        timerId.current = setTimeout(() => setVisible(true), props.delay);
      } else {
        setVisible(true);
      }
    } else if (!show) {
      setVisible(false);
    }
  }

  useEffect(() => {
    if (visible && !document.body.contains(portalRef.current)) {
      document.body.append(portalRef.current);
    } else if (!visible && document.body.contains(portalRef.current)) {
      document.body.removeChild(portalRef.current);
    }
    return () => {
      if (document.body.contains(portalRef.current)) {
        document.body.removeChild(portalRef.current);
      }
    };
  }, [visible]);

  useEffect(() => {
    if (visible && containerRef.current && tooltipRef.current) {
      let positions = {
        top: null,
        left: null,
      };
      let containerRect = containerRef.current.getBoundingClientRect();
      let tooltipRect = tooltipRef.current.getBoundingClientRect();

      if (
        containerRect.y + containerRect.height + offset + tooltipRect.height >=
        window.innerHeight
      ) {
        positions.top = containerRect.top - tooltipRect.height - offset;
      } else {
        positions.top = containerRect.bottom + offset;
      }

      if (
        containerRect.x + containerRect.width / 2 - tooltipRect.width / 2 <=
        0
      ) {
        positions.left = offset;
      } else if (
        containerRect.x + containerRect.width / 2 + tooltipRect.width / 2 >=
        window.innerWidth
      ) {
        positions.left = window.innerWidth - tooltipRect.width - offset;
      } else {
        positions.left =
          containerRect.x + containerRect.width / 2 - tooltipRect.width / 2;
      }

      setPosition((p) => ({
        ...p,
        ...positions,
      }));
    }
    return () => {
      clearTimeout(timerId.current);
    };
  }, [visible]);

  return (
    <div
      className='Tooltip__container'
      onMouseOver={(evt) => toggleVisibility(true)}
      onMouseLeave={(evt) => toggleVisibility(false)}
      onClick={(evt) => toggleVisibility(false)}
      ref={containerRef}
    >
      {props.children}
      {visible &&
        props.tooltip &&
        ReactDOM.createPortal(
          <div className='Tooltip' ref={tooltipRef} style={position}>
            <UI.Text small>{props.tooltip}</UI.Text>
          </div>,
          portalRef.current,
        )}
    </div>
  );
}

Tooltip.defaultProps = {
  delay: 300,
};

Tooltip.propTypes = {
  tooltip: PropTypes.string,
  delay: PropTypes.number,
};

export default Tooltip;
