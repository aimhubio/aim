import React from 'react';

import { Text } from 'components/kit';

import { IBaseComponentProps } from '../../types';

function BaseVisualizer(props: IBaseComponentProps) {
  // const data: any[] = engine.useStore(props.dataSelector);

  return (
    <div className='flex fdc'>
      <Text size={18} color='primary'>
        Visualization
      </Text>
      {/*<JSONViewer json={data?.slice(0, 10) || []} />*/}
    </div>
  );
}

BaseVisualizer.displayName = 'Visualization';

export default BaseVisualizer;
