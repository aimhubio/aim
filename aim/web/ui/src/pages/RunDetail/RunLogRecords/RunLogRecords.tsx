import React from 'react';
import _ from 'lodash-es';

import { Button, Spinner, Text } from 'components/kit';

import LogRecordItem from './LogRecordItem';
import useRunLogRecords from './useRunLogRecords';

import { IRunLogRecordsProps } from '.';

import './RunLogRecords.scss';

function RunLogRecords({
  runHash,
}: IRunLogRecordsProps): React.FunctionComponentElement<React.ReactNode> | null {
  const { data, loadMore, isLoading, fetchedCount, totalRunLogRecordCount } =
    useRunLogRecords(runHash);
  return totalRunLogRecordCount ? (
    <div className='RunLogRecords'>
      <Text size={14} component='h3' tint={100} weight={700}>
        Activity
      </Text>
      {isLoading && _.isEmpty(data) ? (
        <div className='flex fac fjc'>
          <Spinner size='24px' />
        </div>
      ) : (
        <>
          {Object.keys(data).map((key) => (
            <div className='RunLogRecords__content' key={key}>
              <Text
                className='RunLogRecords__content-title'
                component='h3'
                tint={100}
                weight={700}
              >
                {key.split('_').join(' ')}
              </Text>
              {Object.keys(data[key]).map((item: string) => (
                <LogRecordItem key={item} date={item} data={data[key][item]} />
              ))}
            </div>
          ))}

          {fetchedCount < totalRunLogRecordCount ? (
            <Button
              variant='outlined'
              fullWidth
              size='small'
              onClick={isLoading ? undefined : loadMore}
            >
              {isLoading ? 'Loading...' : 'Show more activity'}
            </Button>
          ) : null}
        </>
      )}
    </div>
  ) : null;
}

export default React.memo(RunLogRecords);
