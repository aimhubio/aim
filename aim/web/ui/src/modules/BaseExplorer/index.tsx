import React, { useEffect } from 'react';

import createEngine, { IEngineConfigFinal } from 'modules/core/engine';

import {
  IExplorerConfig,
  IBaseExplorerProps,
  IBaseComponentProps,
} from './types';
import ExplorerBar from './components/ExplorerBar';
import Visualizations from './components/Visualizations';

import './styles.scss';

function TestComponent(props: IBaseComponentProps) {
  const pipeline = props.engine.test;

  const currentQuery = props.engine.useT(
    pipeline.selectors.currentGroupingSelector,
  );

  const currentGrouping = props.engine.useT(
    pipeline.selectors.currentGroupingSelector,
  );

  useEffect(() => {
    console.log('this is testttttt -> ', currentGrouping);
  }, [currentGrouping]);

  return (
    <div>
      <button onClick={() => pipeline.search()}>search</button>{' '}
      <button onClick={() => pipeline.group()}>group</button>{' '}
      <button
        onClick={() => console.log(pipeline.setCurrentQuery({ q: '10' }))}
      >
        Click to check
      </button>
    </div>
  );
}

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
  const state = engineInstance.useStore((state: any) => state);
  useEffect(() => {
    console.log(state);
  }, []);

  return (
    initialized && (
      <div className='Explorer'>
        <TestComponent engine={engineInstance} />
        <ExplorerBar
          engine={props.engineInstance}
          explorerName={props.explorerName}
          documentationLink={props.documentationLink}
        />
        {/* {__DEV__ && <Text>Engine status ::: status</Text>} */}
        <div className='ComponentsWrapper'>
          <components.queryForm engine={props.engineInstance} />
          <components.grouping engine={props.engineInstance} />
        </div>
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
