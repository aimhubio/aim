import React from 'react';
import classNames from 'classnames';

import { Text } from '../kit';

import { IProgressBarProps } from './ProgressBar.d';

import './ProgressBar.scss';

function ProgressBar({
  progress = {},
  processing = false,
  pendingStatus = false,
  setIsProgressBarVisible,
}: IProgressBarProps) {
  const { checked = 0, trackedRuns = 0, matched = 0, percent = 0 } = progress;
  const [renderBar, setRenderBar] = React.useState(false);
  const timeoutIdRef = React.useRef(0);

  React.useEffect(() => {
    if (processing || pendingStatus) {
      setRenderBar(true);
      setIsProgressBarVisible?.(true);
    } else {
      const hidingDelay = 2000;
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = window.setTimeout(() => {
        setRenderBar(false);
      }, hidingDelay);
    }
    return () => {
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current);
      }
      setIsProgressBarVisible?.(false);
    };
  }, [processing, pendingStatus, setIsProgressBarVisible]);

  const barWidth = React.useMemo(
    () => (pendingStatus ? percent + '%' : 'unset'),
    [pendingStatus, percent],
  );
  const fadeOutProgress = React.useMemo(
    () => !(processing || pendingStatus),
    [pendingStatus, processing],
  );
  const title = React.useMemo(
    () => (pendingStatus ? 'Searching over runs...' : 'Processing...'),
    [pendingStatus],
  );

  return renderBar ? (
    <div className={classNames('ProgressBar', { fadeOutProgress })}>
      <div className='ProgressBar__container'>
        <Text
          className='ProgressBar__container__title'
          size={16}
          weight={500}
          component='p'
        >
          {title}
        </Text>
        <div className='ProgressBar__container__bar'>
          <span style={{ width: barWidth }} />
        </div>
        {trackedRuns !== 0 && (
          <div className='ProgressBar__container__info'>
            <Text size={14} weight={500}>
              {checked} of {trackedRuns} checked
            </Text>
            <Text
              className='ProgressBar__container__info__matched'
              size={14}
              weight={600}
              color='success'
            >
              {matched} matched run(s)
            </Text>
          </div>
        )}
      </div>
    </div>
  ) : null;
}

export default React.memo(ProgressBar);
