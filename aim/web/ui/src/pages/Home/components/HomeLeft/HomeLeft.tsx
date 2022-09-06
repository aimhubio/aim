import React from 'react';

import { Text } from 'components/kit';

import HomeBookmarks from './HomeBookmarks/HomeBookmarks';
import QuickLinks from './QuickLinks/QuickLinks';

import './HomeLeft.scss';

function HomeLeft(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <aside className='HomeLeft'>
      <Text className='HomeLeft__title' tint={100} size={24} weight={600}>
        Explore
      </Text>
      <QuickLinks />
      <HomeBookmarks />
    </aside>
  );
}

export default HomeLeft;
