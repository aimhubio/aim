import React, { memo } from 'react';
import ReactJson from 'react-json-view';
import { isEmpty } from 'lodash-es';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IRunDetailParamsTabProps } from './types';

function RunDetailParamsTab({
  runParams,
  isRunInfoLoading,
}: IRunDetailParamsTabProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
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
          <IllustrationBlock
            size='large'
            className='runDetailParamsTabLoader'
            content='No Params'
          />
        )}
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

export default memo(RunDetailParamsTab);
