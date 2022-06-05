import React from 'react';

import { Button, Text } from 'components/kit';

import { IQueryFormProps } from '../../types';

function QueryForm(props: IQueryFormProps) {
  return (
    <div className='flex fdc'>
      <Text size={18} color='primary'>
        Select Form
      </Text>
      <br />
      <div>
        <Button onClick={() => null} color='primary' variant='contained'>
          Search
        </Button>
      </div>
    </div>
  );
}

export default QueryForm;
