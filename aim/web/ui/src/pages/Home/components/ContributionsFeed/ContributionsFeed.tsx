import React from 'react';

import { Text } from 'components/kit';

import useContributionsFeed from './useContributionsFeed';

import './ContributionsFeed.scss';

function ContributionsFeed(): React.FunctionComponentElement<React.ReactNode> {
  const { data } = useContributionsFeed();
  console.log(data);
  return (
    <div className='ContributionsFeed'>
      <Text component='h3' tint={100} weight={700}>
        Activity
      </Text>
    </div>
  );
}

export default React.memo(ContributionsFeed);
