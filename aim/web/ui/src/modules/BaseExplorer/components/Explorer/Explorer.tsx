import React, { useEffect } from 'react';

import Visualizations from '../Visualizations';
import ExplorerBar from '../ExplorerBar';
import ExplorerNotifications from '../ExplorerNotifications';
import { ExplorerProps } from '../../types';

import './styles.scss';

function Explorer({ configuration, engineInstance }: ExplorerProps) {
  const { isLoading } = engineInstance.useStore(
    engineInstance.instructions.statusSelector,
  );

  useEffect(() => {
    const finalize = engineInstance.initialize();
    return () => {
      finalize();
    };
  }, [engineInstance]);

  // @TODO handle error for networks
  return !isLoading ? (
    <div className='Explorer'>
      <ExplorerBar
        engine={engineInstance}
        explorerName={configuration.name}
        // @ts-ignore
        documentationLink={configuration.documentationLink}
      />
      <ExplorerNotifications engine={engineInstance} />
      {/* @ts-ignore*/}
      <configuration.components.queryForm engine={engineInstance} />
      <Visualizations
        getStaticContent={configuration.getStaticContent}
        visualizers={configuration.visualizations}
        engine={engineInstance}
        components={{
          // @ts-ignore
          grouping: configuration.components?.groupingContainer,
        }}
      />
    </div>
  ) : null;
}

export default Explorer;
