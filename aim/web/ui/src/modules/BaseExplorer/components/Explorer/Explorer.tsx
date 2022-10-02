import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Visualizations from '../Visualizations/Visualizations';
import ExplorerBar from '../ExplorerBar';
import { ExplorerProps } from '../../types';

import './styles.scss';

function Explorer({ configuration, engineInstance }: ExplorerProps) {
  const { isLoading } = engineInstance.useStore(
    engineInstance.instructions.statusSelector,
  );
  const history = useHistory();

  useEffect(() => {
    const i = history.listen((d: any) => {
      console.log('useeffect ----> ', d);
    });
    const finalize = engineInstance.initialize();
    return () => {
      finalize();
      i();
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
      {/* @ts-ignore*/}
      <configuration.components.queryForm engine={engineInstance} />
      <Visualizations
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
