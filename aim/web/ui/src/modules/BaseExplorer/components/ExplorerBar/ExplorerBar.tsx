import React, { useEffect } from 'react';

import { Text } from 'components/kit';

import { IBaseComponentProps } from '../../types';

const styles = {
  paddingBottom: 5,
  borderBottom: '1px solid gray',
};

function ExplorerBar(props: IBaseComponentProps) {
  const { engine } = props;
  const params = engine.useStore(engine.instructions.dataSelector);

  useEffect(() => {
    console.log(params);
  }, [params]);

  return (
    <div style={styles}>
      <Text size={24} weight={600}>
        Base Explorer
      </Text>
    </div>
  );
}

export default ExplorerBar;
