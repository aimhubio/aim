import React from 'react';

import AppBar from 'components/AppBar/AppBar';

import { IBaseComponentProps } from '../../types';

interface IExplorerBarProps extends IBaseComponentProps {
  explorerName: string;
}

function ExplorerBar(props: IExplorerBarProps) {
  return (
    <div>
      <AppBar title={props.explorerName} />
    </div>
  );
}

export default ExplorerBar;
