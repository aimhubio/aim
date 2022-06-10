import React from 'react';

import { Button, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IBaseComponentProps } from '../../../types';
import { Order } from '../../../../BaseExplorerCore/pipeline/grouping/types';

import './Grouping.scss';

function Grouping(props: IBaseComponentProps) {
  const engine = props.engine;
  const availableModifiers = engine.useStore(engine.additionalDataSelector);
  const currentValues = engine.useStore(engine.groupings.currentValuesSelector);
  console.log(engine.groupings);
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
    <ErrorBoundary>
      <div className='Grouping'>
        <div className='Grouping__title'>
          <Text size={12} weight={600}>
            Group by
          </Text>
        </div>
        <div className='Grouping__content'>
          <br />
          <Button onClick={group} color='primary' variant='contained'>
            Group
          </Button>
          {/*<JSONViewer json={modifiers || []} />*/}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Grouping;
