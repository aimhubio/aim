import React from 'react';

import { Text } from 'components/kit';

import ReleaseNotes from './ReleaseNotes/ReleaseNotes';

import './DashboardRight.scss';

function DashboardRight(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <aside className='DashboardRight'>
      <Text
        className='DashboardRight__title'
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

export default React.memo(DashboardRight);
