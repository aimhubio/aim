import React, { memo } from 'react';
import ReactJson from 'react-json-view';
import { isEmpty } from 'lodash-es';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

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
      <div className='RunDetailParamsTab'>
        {!isEmpty(runParams) ? (
          <ReactJson name={false} theme='bright:inverted' src={runParams} />
        ) : (
          <IllustrationBlock
            size='large'
            className='runDetailParamsTabLoader'
            content='No Params'
          />
        )}
      </div>
    </BusyLoaderWrapper>
  );
}

export default memo(RunDetailParamsTab);
