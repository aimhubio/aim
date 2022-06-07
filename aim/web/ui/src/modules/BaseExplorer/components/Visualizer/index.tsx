import React from 'react';

import { Button, Text } from 'components/kit';

import { IBaseComponentProps } from '../../types';
function BaseVisualizer(props: IBaseComponentProps) {
  // const data: any[] = engine.useStore(props.dataSelector);
  const engine = props.engine;

  const boxConfig = engine.useStore(engine.boxConfig.stateSelector);

  React.useEffect(() => {
    console.log('boxConfig ----> ', boxConfig);
  }, [boxConfig]);

  function updateBoxSizes() {
    engine.boxConfig.methods.update({
      width: 10,
      height: 10,
    });
  }

  return (
    <div className='flex fdc'>
      <Text size={18} color='primary'>
        Visualization
      </Text>

      <Button onClick={updateBoxSizes}>UpdateBox size</Button>
      {/*<JSONViewer json={data?.slice(0, 10) || []} />*/}
    </div>
  );
}

BaseVisualizer.displayName = 'Visualization';

export default BaseVisualizer;
