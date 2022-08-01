import React from 'react';

import { IControlsProps } from 'modules/BaseExplorer/types';
import { ControlsConfigs } from 'modules/BaseExplorerCore/core-store/controls';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import './styles.scss';

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
