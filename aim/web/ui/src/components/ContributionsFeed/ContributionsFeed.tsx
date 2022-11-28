import React from 'react';
import _ from 'lodash-es';

import { Button, Spinner, Text } from 'components/kit';

import FeedItem from './FeedItem';

import { IContributionsFeedProps } from '.';

import './ContributionsFeed.scss';

function ContributionsFeed({
  data,
  loadMore,
  isLoading,
  totalRunsCount = 0,
  fetchedCount = 0,
  archivedRunsCount = 0,
}: IContributionsFeedProps): React.FunctionComponentElement<React.ReactNode> | null {
  return totalRunsCount && totalRunsCount !== archivedRunsCount ? (
    <div className='ContributionsFeed'>
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
            <div className='ContributionsFeed__content' key={key}>
              <Text
                className='ContributionsFeed__content-title'
                component='h3'
                tint={100}
                weight={700}
              >
                {key.split('_').join(' ')}
              </Text>
              {Object.keys(data[key]).map((item: string) => (
                <FeedItem key={item} date={item} data={data[key][item]} />
              ))}
            </div>
          ))}

          {fetchedCount < totalRunsCount - archivedRunsCount! ? (
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

export default React.memo(ContributionsFeed);
