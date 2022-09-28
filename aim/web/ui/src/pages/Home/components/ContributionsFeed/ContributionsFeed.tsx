import React from 'react';

import useContributionsFeed from './useContrubutionsFeed';

import './ContributionsFeed.scss';

function ContributionsFeed(): React.FunctionComponentElement<React.ReactNode> {
  const { store } = useContributionsFeed();
  console.log(store);
  return <div className='ContributionsFeed'>ContributionsFeed</div>;
}

export default React.memo(ContributionsFeed);
