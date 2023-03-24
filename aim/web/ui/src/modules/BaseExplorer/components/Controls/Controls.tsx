import React from 'react';
import _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ControlsConfigs } from 'modules/core/engine/visualizations/controls';
import { IControlsProps } from 'modules/BaseExplorer/types';

import './Controls.scss';

function Controls(props: IControlsProps) {
  const { engine, visualizationName } = props;
  const { controls = [] } = engine.visualizations[visualizationName] as Record<
    'controls',
    ControlsConfigs & { reset: () => void }
  >;

  const Components = React.useMemo(
    () =>
      Object.entries(_.omit(controls, ['reset'])).map(([key, Control]) => {
        // @ts-ignore
        const Component = Control.component;

        return (
          <div key={key} className='Control'>
            <Component {...props} />
          </div>
        );
      }),
    [controls, props],
  );

  return (
    <ErrorBoundary>
      <div className='BaseControls'>
        <div className='BaseControls__container ScrollBar__hidden'>
          {Components}
        </div>
      </div>
    </ErrorBoundary>
  );
}

Controls.diplayName = 'Controls';

export default React.memo<IControlsProps>(Controls);
