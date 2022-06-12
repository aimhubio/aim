import React, { useEffect } from 'react';

import AppBar from 'components/AppBar/AppBar';

import { IBaseComponentProps } from '../../types';

function ExplorerBar(props: IBaseComponentProps) {
  const { engine } = props;
  const params = engine.useStore(engine.instructions.dataSelector);

  useEffect(() => {
    console.log('ExplorerBar', params);
  }, [params]);

  return (
    <div>
      <AppBar title='Base Explorer' />
    </div>
  );
}

export default ExplorerBar;
