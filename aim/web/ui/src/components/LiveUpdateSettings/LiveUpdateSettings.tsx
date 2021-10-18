import React from 'react';
import { Switcher } from 'components/kit';

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
      <span className='LiveUpdateText'>Live update:</span>
      <Switcher
        checked={Boolean(props.enabled)}
        onChange={() => {
          props.onLiveUpdateConfigChange({ enabled: !props.enabled });
        }}
        size='small'
        color='primary'
      />
    </div>
  );
}

export default React.memo<ILiveUpdateSettingsProp>(LiveUpdateSettings);
