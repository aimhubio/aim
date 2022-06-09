import React from 'react';

import { Button, Text } from 'components/kit';

import { IBaseComponentProps } from '../../types';

function Grouping(props: IBaseComponentProps) {
  const engine = props.engine;
  const state = engine.useStore(engine.groupings.grid.stateSelector);

  React.useEffect(() => {
    console.log('grouping additional state --> ', state);
  }, [state]);

  function updateRowsLength() {
    engine.groupings.grid.methods.update({
      rowLength: 104,
    });
  }

  return (
    <div className='flex fdc'>
      <Text size={18} color='primary'>
        Grouping
      </Text>
      <br />

      <Button onClick={updateRowsLength} color='primary' variant='contained'>
        Group
      </Button>
      {/*<JSONViewer json={modifiers || []} />*/}
    </div>
  );
}

export default Grouping;
