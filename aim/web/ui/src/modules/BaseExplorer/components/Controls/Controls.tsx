import React from 'react';

import { ControlsConfigs } from 'modules/core/engine/store/controls';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IControlsProps } from '../../types';

import './Controls.scss';

function Controls(props: IControlsProps) {
  const { controls = [] } = props.engine as Record<'controls', ControlsConfigs>;

  const Components = React.useMemo(
    () =>
      Object.entries(controls).map(([key, Control]) => (
        <div key={key} className='Control'>
          <Control.component {...props} />
        </div>
      )),
    [controls, props],
  );

  return (
    <ErrorBoundary>
      <div className='Controls'>
        <div className='Controls__container ScrollBar__hidden'>
          {Components}
        </div>
      </div>
    </ErrorBoundary>
  );
}

Controls.diplayName = 'Controls';

export default React.memo<IControlsProps>(Controls);
