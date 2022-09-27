import React from 'react';

import { Text } from 'components/kit';

import { getItem } from 'utils/storage';

import RecentSearchItem from './RecentSearchItem';

import './RecentSearches.scss';

function RecentSearches(): React.FunctionComponentElement<React.ReactNode> | null {
  const [recentSearches, setRecentSearches] = React.useState<
    { explorer: string; query: string }[]
  >([]);

  React.useEffect(() => {
    const recent = getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);
  return recentSearches.length ? (
    <div className='RecentSearches'>
      <Text
        className='RecentSearches__title'
        component='h3'
        size={14}
        tint={100}
        weight={700}
      >
        Recent Searches
      </Text>
      <div>
        {recentSearches.map((item, index) => (
          <RecentSearchItem
            key={index}
            query={item.query}
            explorer={item.explorer}
          />
        ))}
      </div>
    </div>
  ) : null;
}

export default React.memo(RecentSearches);
