import React, { memo } from 'react';
import ReactJson from 'react-json-view';
import { IRunDetailParamsTabProps } from 'types/pages/runs/Runs';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';

function RunDetailParamsTab({
  runParams,
  isRunInfoLoading,
}: IRunDetailParamsTabProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <BusyLoaderWrapper
      isLoading={isRunInfoLoading}
      className='runDetailParamsTabLoader'
      height='100%'
    >
      <div className='RunDetailParamsTab'>
        {!runParams ? (
          <ReactJson name={false} theme='bright:inverted' src={runParams} />
        ) : (
          <EmptyComponent
            size='big'
            className='runDetailParamsTabLoader'
            content='No Params'
          />
        )}
      </div>
    </BusyLoaderWrapper>
  );
}

export default memo(RunDetailParamsTab);
