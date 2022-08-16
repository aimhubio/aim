import React from 'react';

import ProgressBar from 'components/ProgressBar/ProgressBar';

import { IProgressBarProps } from '../../types';

function ProgressBarWrapper(props: IProgressBarProps) {
  const {
    engine: { useStore, pipelineStatusSelector, pipelineProgressSelector },
  } = props;
  const progressData = useStore(pipelineProgressSelector);
  const status = useStore(pipelineStatusSelector);

  return (
    <ProgressBar
      progress={progressData}
      pendingStatus={
        status === 'fetching' ||
        status === 'decoding' ||
        status === 'grouping' ||
        status === 'adopting'
      }
      processing={false}
      setIsProgressBarVisible={() => {}}
    />
  );
}

export default React.memo<IProgressBarProps>(ProgressBarWrapper);
