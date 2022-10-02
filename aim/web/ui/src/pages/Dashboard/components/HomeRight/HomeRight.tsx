import React from 'react';

import { Text } from 'components/kit';

import ReleaseNotes from './ReleaseNotes/ReleaseNotes';

import './HomeRight.scss';

function HomeRight(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <aside className='HomeRight'>
      <Text
        className='HomeRight__title'
        component='h3'
        tint={100}
        size={18}
        weight={600}
      >
        What's New
      </Text>
      <ReleaseNotes />
    </aside>
  );
}

export default React.memo(HomeRight);
