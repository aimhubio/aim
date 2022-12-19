import React from 'react';

import createEngine from 'modules/core/engine/explorer-engine';
import { VisualizationConfig } from 'modules/core/engine/visualizations';

import getDefaultHydration from './getDefaultHydration';
import { ExplorerProps, ExplorerConfiguration } from './types';
import Explorer from './components/Explorer';

function createBasePathFromName(name: string) {
  return name.toLowerCase().split(' ').join('-');
}

export type ExplorerRenderer = (
  configuration: ExplorerConfiguration,
  devtools?: boolean,
) => () => React.ReactElement;

/**
 * createExplorer utility function to easily create new Explorer by providing the root component of the whole explorer
 * This function is useful when creating custom Explorer with the explorer engine configuration
 * This is useful when you want to create your own explorer with custom ui and functionalities
 * The component will receive the  whole configuration
 * @return (configuration: ExplorerConfiguration) => Component
 * @param {React.FunctionComponent<ExplorerProps>} rootContainer - the root of the explorer, as a container of the whole explorer
 */
function createExplorer(
  rootContainer: React.FunctionComponent<ExplorerProps>,
): ExplorerRenderer {
  function _rendererImpl<TObject = unknown>(
    configuration: ExplorerConfiguration,
    devtool: boolean = false,
  ): () => React.ReactElement {
    const defaultHydration = getDefaultHydration();

    const { components, visualizations } = configuration;

    const visualizationsHydration = Object.keys(visualizations).reduce(
      (acc: Record<string, VisualizationConfig>, name: string) => {
        const viz = visualizations[name];
        acc[name] = {
          ...viz,
          controlsContainer: viz.controlsContainer || defaultHydration.Controls,
          box: {
            initialState:
              viz.box.initialState || defaultHydration.box.initialState,
            hasDepthSlider:
              viz.box.hasDepthSlider ?? defaultHydration.box.hasDepthSlider,
            component: viz.box.component,
            persist: viz.box.hasOwnProperty('persist')
              ? viz.box.persist
              : defaultHydration.box.persist,
          },
        };
        return acc;
      },
      {},
    );

    const hydration: ExplorerConfiguration = {
      ...configuration,
      documentationLink:
        configuration.documentationLink || defaultHydration.documentationLink,
      components: {
        groupingContainer:
          components?.groupingContainer || defaultHydration.Groupings,
        queryForm: components?.queryForm || defaultHydration.QueryForm,
      },
      groupings: configuration.groupings || defaultHydration.groupings,
      visualizations: visualizationsHydration,
      states: {
        ...defaultHydration.customStates,
        ...(configuration.states || {}),
      },
      enablePipelineCache: configuration.enablePipelineCache || true,
      getStaticContent:
        configuration.getStaticContent || defaultHydration.getStaticContent,
    };

    const basePath =
      configuration.basePath || createBasePathFromName(configuration.name);
    const engineName = createBasePathFromName(configuration.name);

    const engine = createEngine<TObject>(
      hydration,
      basePath,
      engineName,
      devtool,
    );

    const Container: React.FunctionComponent<ExplorerProps<typeof engine>> =
      rootContainer as React.FunctionComponent<ExplorerProps<typeof engine>>;

    return () => (
      <Container configuration={hydration} engineInstance={engine} />
    );
  }

  return _rendererImpl;
}

const renderer = createExplorer(Explorer);

export default renderer;
export { getDefaultHydration };
