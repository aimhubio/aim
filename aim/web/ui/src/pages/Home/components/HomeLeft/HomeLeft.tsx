import React from 'react';

import { Text } from 'components/kit';

import ExperimentsCard from './ExperimentsCard';
import HomeBookmarks from './DashboardBookmarks/DashboardBookmarks';
import QuickLinks from './QuickLinks/QuickLinks';
import TagsCard from './TagsCard/TagsCard';

import './HomeLeft.scss';

function HomeLeft(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <aside className='HomeLeft'>
      <Text className='HomeLeft__title' tint={100} size={24} weight={600}>
        Explore
      </Text>
      <QuickLinks />
      <ExperimentsCard />
      <TagsCard />
      <HomeBookmarks />
    </aside>
  );
}

export default HomeLeft;
