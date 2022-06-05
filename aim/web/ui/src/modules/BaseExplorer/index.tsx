import React from 'react';

import { Text } from 'components/kit';

import createEngine, {
  IEngineConfigFinal,
} from '../BaseExplorerCore/core-store';

import { IExplorerConfig, IBaseExplorerProps } from './types';

const __DEV__ = process.env.NODE_ENV;

function BaseExplorer(props: IBaseExplorerProps) {
  const {
    ui: { components },
  } = props;

  const visualizations = React.useMemo(() => {
    const p = { engine: props.engineInstance };
    const Visualizations: React.ReactNode[] = components.visualizations.map(
      (Viz) => <Viz key={Viz.displayName} {...p} />,
    );

    return Visualizations;
  }, [props, components.visualizations]);

  return (
    <div style={{ width: '100%', height: '100vh', padding: '10px' }}>
      {__DEV__ && <Text>Pipeline status ::: status</Text>}
      <div className='flex fjb fac' style={{ marginTop: 10 }}>
        <components.queryForm engine={props.engineInstance} />
        <components.grouping engine={props.engineInstance} />
      </div>
      <br />
      <div className='AimVisualizer'>{visualizations}</div>
    </div>
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
  };

  const engine = createEngine(engineConfig);
  console.log(engine);
  return () => <BaseExplorer {...config} engineInstance={engine} />;
}

export default createExplorer;
