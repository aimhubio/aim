import * as React from 'react';

import renderer from 'modules/BaseExplorer';

import { metricsExplorerConfig } from 'pages/Explorers/MetricsExplorer';
import { figuresExplorerConfig } from 'pages/Explorers/FiguresExplorer';
import { audiosExplorerConfig } from 'pages/Explorers/AudiosExplorer';
import { textExplorerConfig } from 'pages/Explorers/TextExplorer';

function ExplorerVizElement(props: any) {
  const state = {
    query: {
      form: {
        advancedInput: props.options.query,
        advancedModeOn: true,
        simpleInput: '',
        selections: [],
      },
      ranges: {
        isApplyButtonDisabled: true,
        isValid: true,
      },
    },
  };

  const Component = ExplorersMap[props.data?.toLowerCase()](state);

  Component.setState(state);

  return Component ? (
    <div
      className='VizComponentContainer'
      style={{ display: 'block', padding: 0 }}
    >
      <Component />
    </div>
  ) : null;
}

const ExplorersMap: Record<string, any> = {
  metrics: (state: Record<string, any>) =>
    renderer({
      ...metricsExplorerConfig,
      persist: false,
      initialState: state,
    }),
  figures: (state: Record<string, any>) =>
    renderer({
      ...figuresExplorerConfig,
      persist: false,
      initialState: state,
    }),
  audios: (state: Record<string, any>) =>
    renderer({
      ...audiosExplorerConfig,
      persist: false,
      initialState: state,
    }),
  texts: (state: Record<string, any>) =>
    renderer({
      ...textExplorerConfig,
      persist: false,
      initialState: state,
    }),
};

export default ExplorerVizElement;
