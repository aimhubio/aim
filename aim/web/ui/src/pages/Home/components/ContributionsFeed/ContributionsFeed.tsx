import React from 'react';

import { Text } from 'components/kit';

import useContributionsFeed from './useContributionsFeed';
import FeedItem from './FeedItem/FeedItem';

import './ContributionsFeed.scss';

function ContributionsFeed(): React.FunctionComponentElement<React.ReactNode> {
  const { data } = useContributionsFeed();
  console.log(Object.keys(data));
  return (
    <div className='ContributionsFeed'>
      <Text component='h3' tint={100} weight={700}>
        Activity
      </Text>
      {Object.keys(data).map((key) => (
        <div className='Contribution__content' key={key}>
          <Text className='' component='h3' tint={100} weight={700}>
            {key.split('_').join(' ')}
          </Text>
          {Object.keys(data[key]).map((item: string) => {
            return (
              <div key={item}>
                <Text tint={50} size={10} weight={700}>
                  {item.split('_').join(' ')}
                </Text>
                <FeedItem data={data[key][item]} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default React.memo(ContributionsFeed);
