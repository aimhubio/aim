import React from 'react';

import { Button, Text } from 'components/kit';

import { IBaseComponentProps } from '../../types';
import { Order } from '../../../BaseExplorerCore/pipeline/grouping/types';

function Grouping(props: IBaseComponentProps) {
  const engine = props.engine;
  const availableModifiers = engine.useStore(engine.additionalDataSelector);
  const currentValues = engine.useStore(engine.groupings.currentValuesSelector);

  const state = engine.useStore(engine.groupings.grid.stateSelector);

  React.useEffect(() => {
    console.log('grid current values --> ', currentValues);
  }, [currentValues]);

  React.useEffect(() => {
    console.log('modifiers --> ', availableModifiers);
  }, [availableModifiers]);

  function updateRowsLength() {
    engine.groupings.grid.methods.update({
      rowLength: 104,
    });
  }

  function group() {
    // engine.group(); reset all
    // engine.group({}); reset all
    // engine.group({ grid: {fields: ['run.hash'], orders: [Order.ASC]}}); keep only grid
    engine.group({
      ...currentValues,
      grid: { fields: ['run.hash'], orders: [Order.ASC] },
    }); // keep all groupings + grid
  }

  return (
    <div className='flex fdc'>
      <Text size={18} color='primary'>
        Grouping
      </Text>
      <br />

      <Button onClick={group} color='primary' variant='contained'>
        Group
      </Button>
      {/*<JSONViewer json={modifiers || []} />*/}
    </div>
  );
}

export default Grouping;
