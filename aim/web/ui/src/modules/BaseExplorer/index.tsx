import React, { useEffect } from 'react';

import { Text } from 'components/kit';

import createEngine, {
  IEngineConfigFinal,
} from '../BaseExplorerCore/core-store';

import { IExplorerConfig, IBaseExplorerProps } from './types';
import ExplorerBar from './components/EexplorerBar';

const __DEV__ = process.env.NODE_ENV;

function BaseExplorer(props: IBaseExplorerProps) {
  const {
    ui: { components },
    engineInstance,
  } = props;

  const { initialized } = engineInstance.useStore(
    engineInstance.engineStatusSelector,
  );

  useEffect(() => {
    engineInstance.initialize();
  }, [engineInstance]);

  const visualizations = React.useMemo(() => {
    const p = { engine: engineInstance };
    const Visualizations: React.ReactNode[] = components.visualizations.map(
      (Viz) => <Viz key={Viz.displayName} {...p} />,
    );

    return Visualizations;
  }, [engineInstance, components.visualizations]);

  return initialized ? (
    <div style={{ width: '100%', height: '100vh', padding: '10px' }}>
      <ExplorerBar engine={props.engineInstance} />
      {__DEV__ && <Text>Engine status ::: status</Text>}
      <div className='flex fjb fac' style={{ marginTop: 10 }}>
        <components.queryForm engine={props.engineInstance} />
        <components.grouping engine={props.engineInstance} />
      </div>
      <br />
      <div className='AimVisualizer'>{visualizations}</div>
    </div>
  ) : (
    <>
      {console.log('initializing')}
      <div>Initializing</div>
    </>
  );
}

function createExplorer(config: IExplorerConfig): () => React.ReactElement {
  const { ui, engine: EC } = config;

  const engineConfig: IEngineConfigFinal = {
    defaultBoxConfig: ui.defaultBoxConfig,
    sequenceName: EC.sequenceName,
    adapter: {
      objectDepth: EC.adapter.objectDepth,
    },
    states: config.states,
  };

  const engine = createEngine(engineConfig);

  return () => <BaseExplorer {...config} engineInstance={engine} />;
}

export default createExplorer;
