import React, { useEffect } from 'react';

import { Button, Text } from 'components/kit';

import { IQueryFormProps } from '../../types';

function QueryForm(props: IQueryFormProps) {
  const engine = props.engine;
  const queryable = engine.useStore(engine.instructions.dataSelector);

  const query = engine.useStore((state: any) => state.queryUI);

  useEffect(() => {
    console.log('queryable --> ', queryable);
  }, [queryable]);

  useEffect(() => {
    console.log('query ----> ', query);
  }, [query]);

  function onInputChange() {
    engine.queryUI.methods.update({ simpleInput: 'run.batch_size > 64' });
  }

  function onAdvancedInputChange() {
    engine.queryUI.methods.update({
      advancedQuery: '((run.batch_size > 64) and (images.name == "stars"))',
    });
  }

  return (
    <div className='flex fdc'>
      <Text size={18} color='primary'>
        Select Form
      </Text>
      <br />
      <div>
        <Button onClick={onInputChange} color='primary' variant='contained'>
          Search
        </Button>
      </div>
    </div>
  );
}

export default QueryForm;
