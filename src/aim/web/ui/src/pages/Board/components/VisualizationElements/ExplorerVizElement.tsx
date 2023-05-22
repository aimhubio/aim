import * as React from 'react';
import produce from 'immer';

import renderer from 'modules/BaseExplorer';
import { ExplorerConfiguration } from 'modules/BaseExplorer/types';

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

  const Component = React.useMemo(() => {
    const explorer = ExplorersMap[props.data?.toLowerCase()];
    const appContainerNode = document.querySelector(
      '.BoardVisualizer__main__components__viz',
    );
    return explorer ? explorer(state, appContainerNode) : null;
  }, [props.data]);

  Component?.setState(state);

  return Component ? (
    <div
      className='VizComponentContainer'
      style={{ display: 'block', padding: 0, overflow: 'hidden' }}
    >
      <Component />
    </div>
  ) : null;
}

const getStaticConfig = (configuration: ExplorerConfiguration) => {
  return produce(configuration, (draft) => {
    draft.persist = false;
    draft.hideExplorerBar = true;
    draft.hideQueryForm = true;
  });
};

const ExplorersMap: Record<string, any> = {
  metrics: (state: Record<string, any>, appContainerNode: HTMLDivElement) => {
    const config = produce(getStaticConfig(metricsExplorerConfig), (draft) => {
      draft.initialState = state;
      draft.visualizations.vis1.widgets!.tooltip.props!.appContainerNode =
        appContainerNode;
    });
    return renderer(config);
  },
  figures: (state: Record<string, any>, appContainerNode: HTMLDivElement) => {
    const config = produce(getStaticConfig(figuresExplorerConfig), (draft) => {
      draft.initialState = state;
      draft.visualizations.vis1.widgets!.tooltip.props!.appContainerNode =
        appContainerNode;
    });
    return renderer(config);
  },
  audios: (state: Record<string, any>, appContainerNode: HTMLDivElement) => {
    const config = produce(getStaticConfig(audiosExplorerConfig), (draft) => {
      draft.initialState = state;
      draft.visualizations.vis1.widgets!.tooltip.props!.appContainerNode =
        appContainerNode;
    });
    return renderer(config);
  },
  texts: (state: Record<string, any>, appContainerNode: HTMLDivElement) => {
    const config = produce(getStaticConfig(textExplorerConfig), (draft) => {
      draft.initialState = state;
      draft.visualizations.vis1.widgets!.tooltip.props!.appContainerNode =
        appContainerNode;
    });
    return renderer(config);
  },
};

export default ExplorerVizElement;
