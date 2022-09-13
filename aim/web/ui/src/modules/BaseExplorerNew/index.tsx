import React, { useEffect } from 'react';

import createEngine from 'modules/core/engine/explorer-engine';

import ExplorerBar from './components/ExplorerBar';
import getDefaultHydration from './getDefaultHydration';
import { BaseExplorerPropsNew, ExplorerConfiguration } from './types';

import './styles.scss';

function BaseExplorerNew({
  configuration,
  engineInstance,
}: BaseExplorerPropsNew) {
  const { isLoading } = engineInstance.useStore(
    engineInstance.instructions.statusSelector,
  );

  useEffect(() => {
    engineInstance.initialize().then().catch();
  }, [engineInstance]);

  // @TODO handle error for networks
  return !isLoading ? (
    <div className='Explorer'>
      <ExplorerBar
        engine={engineInstance}
        explorerName={configuration.name}
        documentationLink={configuration.documentationLink}
      />
      {/* {__DEV__ && <Text>Engine status ::: status</Text>} */}
      <div className='ComponentsWrapper'>
        {/* @ts-ignore*/}
        <configuration.components.queryForm engine={engineInstance} />
        {/* @ts-ignore*/}
        <configuration.components.groupingContainer engine={engineInstance} />
      </div>
      {/*<Visualizations components={components} engine={engineInstance} />*/}
    </div>
  ) : null;
}

function createBasePathFromName(name: string) {
  return name.toLowerCase().split(' ').join('-');
}

type ExplorerRenderer = (
  configuration: ExplorerConfiguration,
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
  function _rendererImpl<TObject = unknown>(
    configuration: ExplorerConfiguration,
  ): () => React.ReactElement {
    const defaultHydration = getDefaultHydration();

    const { components } = configuration;

    const hydration: ExplorerConfiguration = {
      ...configuration,
      documentationLink:
        configuration.documentationLink || defaultHydration.documentationLink,
      basePath:
        configuration.basePath || createBasePathFromName(configuration.name),
      components: {
        groupingContainer:
          components?.groupingContainer || defaultHydration.Groupings,
        queryForm: components?.queryForm || defaultHydration.QueryForm,
      },
    };

    const engine = createEngine<TObject>(hydration, configuration.basePath);

    const Container: React.FunctionComponent<
      BaseExplorerPropsNew<typeof engine>
    > = rootContainer as React.FunctionComponent<
      BaseExplorerPropsNew<typeof engine>
    >;

    return () => (
      <Container configuration={hydration} engineInstance={engine} />
    );
  }

  return _rendererImpl;
}

const renderer = createExplorer(BaseExplorerNew);

export default renderer;
export { getDefaultHydration };
