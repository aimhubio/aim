import React from 'react';

import ProgressBar from 'components/ProgressBar/ProgressBar';

import { IProgressBarProps } from '../../types';

function ProgressBarWrapper(props: IProgressBarProps) {
  const {
    engine: {
      useStore,
      pipelineStatusSelector,
      pipelineProgressSelector,
      resetPipelineProgress,
    },
  } = props;
  const progressData = useStore(pipelineProgressSelector);
  const status = useStore(pipelineStatusSelector);

  const setIsProgressBarVisible = React.useCallback(() => {
    resetPipelineProgress();
  }, [resetPipelineProgress]);

  return (
    <ProgressBar
      progress={progressData}
      pendingStatus={
        status === 'fetching' || status === 'decoding' || status === 'adopting'
      }
      processing={false}
      setIsProgressBarVisible={setIsProgressBarVisible}
    />
  );
}

export default React.memo<IProgressBarProps>(ProgressBarWrapper);
