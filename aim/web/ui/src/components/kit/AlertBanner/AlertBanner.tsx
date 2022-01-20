import React, { useEffect, useMemo, useState } from 'react';
import { isNil } from 'lodash';

import { Icon, Button } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IAlertBannerProps } from './AlertBanner.d';
import { typesMetadata } from './config';

import './AlertBanner.scss';

function AlertBanner({
  children,
  type,
  visibilityDuration = 6000,
  isVisiblePermanently = false,
}: IAlertBannerProps): React.FunctionComponentElement<React.ReactNode> {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const memoizedTypeMetadata = useMemo(() => {
    return typesMetadata[type];
  }, [type]);

  const onClose = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    let timeoutPath: any = null;

    if (!isVisiblePermanently) {
      timeoutPath = setTimeout(onClose, visibilityDuration);
    }

    return () => {
      if (!isNil(timeoutPath)) {
        clearTimeout(timeoutPath);
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      {isVisible && (
        <div
          className={`AlertBanner AlertBanner_${memoizedTypeMetadata.cssClassName}`}
        >
          <Icon
            name={memoizedTypeMetadata.iconName}
            className={`AlertBanner_iconCnt AlertBanner_${memoizedTypeMetadata.cssClassName}_iconCnt`}
          />
          <p>{children}</p>
          <Button color='secondary' withOnlyIcon onClick={onClose}>
            <Icon name='close' />
          </Button>
        </div>
      )}
    </ErrorBoundary>
  );
}

AlertBanner.displayName = 'AlertBanner';

export default React.memo<IAlertBannerProps>(AlertBanner);
