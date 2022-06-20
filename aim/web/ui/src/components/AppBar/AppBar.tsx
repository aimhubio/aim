import React from 'react';
import classNames from 'classnames';

import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IAppBarProps } from 'types/components/AppBar/AppBar';

import './AppBar.scss';

function AppBar(
  props: IAppBarProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div
        className={classNames('AppBar', {
          [props?.className ?? '']: props.className,
        })}
      >
        <Text
          component='h3'
          weight={600}
          size={14}
          tint={100}
          className='AppBar__title'
        >
          {props.title}
        </Text>
        {props.children && (
          <div
            className={classNames('AppBar__content', {
              'AppBar__content--disabled': props.disabled,
              [props?.className ?? '']: props.className,
            })}
          >
            {props.children}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default AppBar;
