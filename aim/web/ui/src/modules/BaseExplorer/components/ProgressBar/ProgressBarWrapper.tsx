import React from 'react';

import ProgressBar from 'components/ProgressBar/ProgressBar';

import { PipelineStatusEnum } from 'modules/core/engine/types';
import { IProgressBarProps } from 'modules/BaseExplorer/types';

function ProgressBarWrapper(
  props: Omit<IProgressBarProps, 'visualizationName'>,
) {
  const {
    engine: { useStore, pipeline },
  } = props;
  const progressData = useStore(pipeline.progressSelector);
  const status = useStore(pipeline.statusSelector);

  const setIsProgressBarVisible = React.useCallback(
    (isVisible: boolean) => {
      !isVisible && pipeline.resetProgress();
    },
    [pipeline],
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

export default React.memo<Omit<IProgressBarProps, 'visualizationName'>>(
  ProgressBarWrapper,
);
