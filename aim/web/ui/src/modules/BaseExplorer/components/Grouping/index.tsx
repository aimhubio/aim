import React from 'react';

import { Button, Text } from 'components/kit';

import { IBaseComponentProps } from '../../types';

function Grouping(props: IBaseComponentProps) {
  const engine = props.engine;
  const customState = engine.useStore(engine.custom1.stateSelector);

  React.useEffect(() => {
    console.log('custom1 --> ', customState);
  }, [customState]);

  function updateCustomState() {
    engine.custom1.methods.update({
      rowLength: 104,
    });
  }
  return (
    <div className='flex fdc'>
      <Text size={18} color='primary'>
        Grouping
      </Text>
      <br />

      <Button onClick={updateCustomState} color='primary' variant='contained'>
        Group
      </Button>
      {/*<JSONViewer json={modifiers || []} />*/}
    </div>
  );
}

export default Grouping;
