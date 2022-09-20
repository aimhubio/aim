import React from 'react';

import { PipelineStatusEnum } from 'modules/core/engine';

import ProgressBar from 'components/ProgressBar/ProgressBar';

import { IProgressBarProps } from '../../types';

function ProgressBarWrapper(props: IProgressBarProps) {
  const {
    engine: { useStore, pipeline },
  } = props;
  const progressData = useStore(pipeline.progressSelector);
  const status = useStore(pipeline.statusSelector);

  const setIsProgressBarVisible = React.useCallback(
    (isVisible: boolean) => {
      !isVisible && pipeline.resetProgress();
    },
    [pipeline.resetProgress],
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
