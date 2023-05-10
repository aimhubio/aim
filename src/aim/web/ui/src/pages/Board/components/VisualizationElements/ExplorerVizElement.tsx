import * as React from 'react';

import renderer from 'modules/BaseExplorer';

import { metricsExplorerConfig } from 'pages/Explorers/MetricsExplorer';

import routes from 'routes/routes';

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

  React.useEffect(() => {}, [props.options.query]);

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
  figures: () => routes.FIGURES_EXPLORER.component,
  audios: () => routes.AUDIOS_EXPLORER.component,
  texts: () => routes.TEXT_EXPLORER.component,
};

export default ExplorerVizElement;
