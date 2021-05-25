import './Popover.less';

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { classNames } from '../../../utils';
import UI from '../..';

const margin = 5;
const offset = 30;

function Popover(props) {
  let [opened, setOpened] = useState(false);
  let [position, setPosition] = useState({});

  let containerRectRef = useRef();
  let containerRef = useRef();
  let popupRef = useRef();
  let portalRef = useRef(document.createElement('div'));
  let timerRef = useRef();

  useEffect(() => {
    if (opened && !document.body.contains(portalRef.current)) {
      document.body.append(portalRef.current);
    } else if (!opened && document.body.contains(portalRef.current)) {
      document.body.removeChild(portalRef.current);
    }
    return () => {
      if (document.body.contains(portalRef.current)) {
        document.body.removeChild(portalRef.current);
      }
    };
  }, [opened]);

  useEffect(() => {
    if (opened && popupRef.current) {
      popupRef.current.focus();
      containerRectRef.current = containerRef.current.getBoundingClientRect();
    }
  }, [opened]);

  useEffect(() => {
    if (opened && containerRef.current && popupRef.current) {
      calculatePosition();
      timerRef.current = setInterval(() => {
        if (containerRef.current && popupRef.current) {
          let containerRect = containerRef.current.getBoundingClientRect();
          if (
            Math.abs(containerRectRef.current.x - containerRect.x) > offset ||
            Math.abs(containerRectRef.current.y - containerRect.y) > offset
          ) {
            setOpened(false);
          } else {
            calculatePosition();
          }
        }
      }, 250);
    }
    return () => {
      clearInterval(timerRef.current);
    };
  }, [opened]);

  function calculatePosition() {
    let positions = {
      top: null,
      left: null,
    };
    let containerRect = containerRef.current.getBoundingClientRect();
    let popupRect = popupRef.current.getBoundingClientRect();

    if (!containerRectRef.current) {
      containerRectRef.current = containerRect;
    }

    if (
      containerRect.y + containerRect.height + margin + popupRect.height >=
      window.innerHeight
    ) {
      positions.top = containerRect.top - popupRect.height - margin;
    } else {
      positions.top = containerRect.bottom + margin;
    }

    if (props.alignBy === 'left') {
      if (window.innerWidth - (containerRect.x + popupRect.width) <= 10) {
        positions.left = window.innerWidth - popupRect.width - margin;
      } else {
        positions.left = containerRect.x;
      }
    } else {
      if (containerRect.x - popupRect.width + containerRect.width <= 10) {
        positions.left = margin;
      } else {
        positions.left =
          containerRect.x - popupRect.width + containerRect.width;
      }
    }

    setPosition((p) => ({
      ...p,
      ...positions,
    }));
  }

  return (
    <>
      <UI.Tooltip tooltip={props.tooltip}>
        <div
          ref={containerRef}
          className={classNames({
            Popover__target: true,
            [typeof props.targetClassName === 'function'
              ? props.targetClassName(opened)
              : props.targetClassName]: !!props.targetClassName,
          })}
          onClick={(evt) => {
            evt.stopPropagation();
            setOpened(!opened);
          }}
        >
          {typeof props.target === 'function'
            ? props.target(opened)
            : props.target}
        </div>
      </UI.Tooltip>
      {opened &&
        ReactDOM.createPortal(
          <div
            className={classNames({
              Popover__body: true,
              [props.popupClassName]: !!props.popupClassName,
            })}
            tabIndex={0}
            ref={popupRef}
            style={position}
            onClick={(evt) => evt.stopPropagation()}
            onBlur={(evt) => {
              const currentTarget = evt.currentTarget;
              if (opened) {
                window.setTimeout(() => {
                  if (!currentTarget.contains(document.activeElement)) {
                    setOpened(false);
                  }
                }, 200);
              }
            }}
          >
            {typeof props.content === 'function'
              ? props.content(opened, setOpened)
              : props.content}
          </div>,
          portalRef.current,
        )}
    </>
  );
}

export default Popover;
