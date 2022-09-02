import React from 'react';

import HomeBookmarks from './HomeBookmarks/HomeBookmarks';

import './HomeLeft.scss';

function HomeLeft(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <aside className='HomeLeft'>
      <HomeBookmarks />
    </aside>
  );
}

export default HomeLeft;
