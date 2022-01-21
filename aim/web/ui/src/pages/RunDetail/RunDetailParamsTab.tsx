import React, { memo } from 'react';
import ReactJson from 'react-json-view';
import { isEmpty } from 'lodash-es';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';

import { IRunDetailParamsTabProps } from './types';

function RunDetailParamsTab({
  runParams,
  isRunInfoLoading,
}: IRunDetailParamsTabProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <BusyLoaderWrapper
      isLoading={isRunInfoLoading || !runParams}
      className='runDetailParamsTabLoader'
      height='100%'
    >
      {!isEmpty(runParams) ? (
        <div className='RunDetailParamsTabWrapper'>
          <div className='RunDetailParamsTab'>
            <ReactJson name={false} theme='bright:inverted' src={runParams} />
          </div>
        </div>
      ) : (
        <EmptyComponent
          size='big'
          className='runDetailParamsTabLoader'
          content='No Params'
        />
      )}
    </BusyLoaderWrapper>
  );
}

export default memo(RunDetailParamsTab);
