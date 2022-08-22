import React from 'react';

import { PipelineStatusEnum } from 'modules/core/engine';

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

  const setIsProgressBarVisible = React.useCallback(
    (isVisible: boolean) => {
      !isVisible && resetPipelineProgress();
    },
    [resetPipelineProgress],
  );

  return (
    <ProgressBar
      progress={progressData}
      pendingStatus={status === PipelineStatusEnum.Executing}
      processing={false}
      setIsProgressBarVisible={setIsProgressBarVisible}
    />
  );
}

export default React.memo<IProgressBarProps>(ProgressBarWrapper);
