import React, { useEffect } from 'react';

import createEngine, { IEngineConfigFinal } from 'modules/core/engine';

import { IExplorerConfig, IBaseExplorerProps } from './types';
import ExplorerBar from './components/ExplorerBar';
import Visualizations from './components/Visualizations';

import './styles.scss';

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

  return (
    initialized && (
      <div className='Explorer'>
        <ExplorerBar
          engine={props.engineInstance}
          explorerName={props.explorerName}
          documentationLink={props.documentationLink}
        />
        {/* {__DEV__ && <Text>Engine status ::: status</Text>} */}
        <components.queryForm engine={props.engineInstance} />
        <components.grouping engine={props.engineInstance} />
        <Visualizations components={components} engine={engineInstance} />
      </div>
    )
  );
}

function createExplorer(config: IExplorerConfig): () => React.ReactElement {
  const { ui, engine: EC } = config;

  const engineConfig: IEngineConfigFinal = {
    defaultBoxConfig: ui.defaultBoxConfig,
    sequenceName: EC.sequenceName,
    useCache: EC.useCache,
    adapter: {
      objectDepth: EC.adapter.objectDepth,
    },
    states: config.states,
    grouping: EC.grouping,
    controls: EC.controls,
  };

  const engine = createEngine(engineConfig);

  return (): JSX.Element => (
    <BaseExplorer {...config} engineInstance={engine} />
  );
}

export default createExplorer;
