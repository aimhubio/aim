import React from 'react';

import { Button, Text } from 'components/kit';

import { IBaseComponentProps } from '../../types';

function Grouping(props: IBaseComponentProps) {
  return (
    <div className='flex fdc'>
      <Text size={18} color='primary'>
        Grouping
      </Text>
      <br />

      <Button onClick={() => null} color='primary' variant='contained'>
        Group
      </Button>
      {/*<JSONViewer json={modifiers || []} />*/}
    </div>
  );
}

export default Grouping;
