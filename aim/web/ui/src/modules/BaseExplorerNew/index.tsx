import React, { useEffect } from 'react';

import createEngine from 'modules/core/engine/explorer-engine';

import getDefaultHydration from './getDefaultHydration';
import {
  IBaseComponentProps,
  BaseExplorerPropsNew,
  ExplorerConfiguration,
  IBaseExplorerProps,
} from './types';

import './styles.scss';

function TestComponent(props: IBaseComponentProps) {
  const visualizations = props.engine.visualizations;

  const control1 = props.engine.useStore(
    visualizations['viz1'].controls.boxProperties.stateSelector,
  );
  const control2 = props.engine.useStore(
    visualizations['viz2'].controls.boxProperties.stateSelector,
  );

  useEffect(() => {
    console.log('box1 ---> ', control1);
  }, [control1]);

  useEffect(() => {
    console.log('box2 ---> ', control2);
  }, [control2]);

  return (
    <div>
      <button
        onClick={() =>
          visualizations.viz1.controls.boxProperties.methods.update({
            width: 'box1',
          })
        }
      >
        update box1
      </button>{' '}
      <button
        onClick={() => {
          visualizations.viz2.controls.boxProperties.methods.update({
            width: 'box2',
          });
        }}
      >
        update box2
      </button>
      <button
        onClick={() => {
          visualizations.reset();
        }}
      >
        reset
      </button>
    </div>
  );
}

function BaseExplorerNew(props: BaseExplorerPropsNew) {
  // const { initialized } = engineInstance.useStore(
  //   engineInstance.engineStatusSelector,
  // );

  // useEffect(() => {
  //   engineInstance.initialize();
  // }, [engineInstance]);
  // const state = engineInstance.useStore((state: any) => state);
  // useEffect(() => {
  //   console.log(state);
  // }, []);
  return (
    // initialized && (
    <div className='Explorer'>
      {/*<TestComponent engine={{}} />*/}
      {/*<ExplorerBar*/}
      {/*  engine={props.engineInstance}*/}
      {/*  explorerName={props.explorerName}*/}
      {/*  documentationLink={props.documentationLink}*/}
      {/*/>*/}
      {/* {__DEV__ && <Text>Engine status ::: status</Text>} */}
      <div className='ComponentsWrapper'>
        {/*<components.queryForm engine={props.engineInstance} />*/}
        {/*<components.grouping engine={props.engineInstance} />*/}
      </div>
      {/*<Visualizations components={components} engine={engineInstance} />*/}
    </div>
    // )
  );
}

function createBasePathFromName(name: string) {
  return name.toLowerCase().split(' ').join('-');
}

type ExplorerRenderer = (
  options: ExplorerConfiguration,
) => () => React.ReactElement;

/**
 * createExplorer utility function to easily create new Explorer by providing the root component of the whole explorer
 * This function is useful when creating custom Explorer with the explorer engine configuration
 * This is useful when you want to create your own explorer with custom ui and functionalities
 * The component will receive the  whole configuration
 * @return (configuration: ExplorerConfiguration) => Component
 * @param {React.FunctionComponent<BaseExplorerPropsNew>} rootContainer - the root of the explorer, as a container of the whole explorer
 */
function createExplorer(
  rootContainer: React.FunctionComponent<BaseExplorerPropsNew>,
): ExplorerRenderer {
  function _rendererImpl<TObject>(configuration: ExplorerConfiguration) {
    const defaultHydration = getDefaultHydration();

    const { components } = configuration;

    const beforeEngineHydration: ExplorerConfiguration = {
      ...configuration,
      documentationLink: configuration.documentationLink,
      basePath:
        configuration.basePath || createBasePathFromName(configuration.name),
      components: {
        groupings: components?.groupings || defaultHydration.Groupings,
        queryForm: components?.queryForm || defaultHydration.QueryForm,
      },
    };

    const engine = createEngine<TObject>(
      beforeEngineHydration,
      configuration.name,
    );

    const Container: React.FunctionComponent<
      BaseExplorerPropsNew<typeof engine>
    > = rootContainer as React.FunctionComponent<
      BaseExplorerPropsNew<typeof engine>
    >;

    return () => (
      <Container
        configuration={beforeEngineHydration}
        engineInstance={engine}
      />
    );
  }

  return _rendererImpl;
}

const renderer = createExplorer(BaseExplorerNew);

export default renderer;
export { getDefaultHydration };
