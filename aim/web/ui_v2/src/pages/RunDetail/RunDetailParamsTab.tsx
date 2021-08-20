import React, { memo } from 'react';
import ReactJson from 'react-json-view';
import { IRunDetailParamsTabProps } from 'types/pages/runs/Runs';

function RunDetailParamsTab({
  runParams,
}: IRunDetailParamsTabProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='RunDetailParamsTab'>
      {runParams && (
        <ReactJson name={false} theme='bright:inverted' src={runParams} />
      )}
    </div>
  );
}

export default memo(RunDetailParamsTab);
