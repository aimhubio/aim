import React from 'react';

import { Button, Text } from 'components/kit';

import useContributionsFeed from './useContributionsFeed';
import FeedItem from './FeedItem/FeedItem';

import './ContributionsFeed.scss';

function ContributionsFeed(): React.FunctionComponentElement<React.ReactNode> | null {
  const { data, loadMore, isLoading, totalRunsCount, fetchedCount } =
    useContributionsFeed();
  return totalRunsCount ? (
    <div className='ContributionsFeed'>
      <Text size={14} component='h3' tint={100} weight={700}>
        Activity
      </Text>
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
          {Object.keys(data[key]).map((item: string) => {
            return <FeedItem key={item} date={item} data={data[key][item]} />;
          })}
        </div>
      ))}
      {fetchedCount < totalRunsCount! ? (
        <Button
          variant='outlined'
          fullWidth
          size='small'
          onClick={isLoading ? undefined : loadMore}
        >
          {isLoading ? 'Loading...' : 'Show more activity'}
        </Button>
      ) : null}
    </div>
  ) : null;
}

export default React.memo(ContributionsFeed);
