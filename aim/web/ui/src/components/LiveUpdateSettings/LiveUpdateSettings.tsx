import React from 'react';
import { Switch } from '@material-ui/core';

import './LiveUpdateSettings.scss';

export interface ILiveUpdateSettingsProp {
  delay: number;
  enabled: boolean;
  onLiveUpdateConfigChange: ({}) => void;
}

function LiveUpdateSettings(
  props: ILiveUpdateSettingsProp,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='App_LiveUpdateSettings_Container'>
      <span>Live update:</span>
      <Switch
        disableRipple
        checked={props.enabled}
        onChange={() =>
          props.onLiveUpdateConfigChange({ enabled: !props.enabled })
        }
        color='primary'
      />
    </div>
  );
}

export default React.memo<ILiveUpdateSettingsProp>(LiveUpdateSettings);
