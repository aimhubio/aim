import React, { useEffect } from 'react';
// @ts-ignore
import JSONViewer from 'react-json-viewer';

import generateEngine from 'modules/BaseExplorerCore/core-store';

import { Button, Text } from 'components/kit';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

const engine = generateEngine();

type ExplorerConfig = {
  sequenceName: SequenceTypesEnum;
  objectDepth: AimObjectDepths;
  useCache: boolean;
};

const config: ExplorerConfig = {
  sequenceName: SequenceTypesEnum.Images,
  objectDepth: AimObjectDepths.Index,
  useCache: false,
};

function BasExplorer() {
  const sequence = engine.useStore(engine.sequenceNameSelector);
  const pipelineStatus = engine.useStore(engine.pipelineStatusSelector);

  useEffect(() => {
    engine.initialize(config);
  }, []);

  useEffect(() => {
    console.log(pipelineStatus);
  }, [pipelineStatus]);

  useEffect(() => {
    console.log(sequence);
  }, [sequence]);

  return (
    <div style={{ width: '100%', height: '100vh', padding: '10px' }}>
      <h2>Pipeline status ::: {pipelineStatus}</h2>
      <div className='flex fj-sb fac' style={{ marginTop: 10 }}>
        <QueryForm dataSelector={engine.instructionsSelector} />
        <Modification dataSelector={engine.additionalDataSelector} />
      </div>
      <Visualization dataSelector={engine.dataSelector} />
    </div>
  );
}

function Visualization(props: any) {
  const data: any[] = engine.useStore(props.dataSelector);

  return (
    <div>
      <Text size={24} color='primary'>
        Visualization
      </Text>
      <JSONViewer json={data?.slice(0, 10) || []} />
    </div>
  );
}

function Modification(props: any) {
  const data: object = engine.useStore(props.dataSelector);

  // @ts-ignore
  const modifiers = data?.modifiers;

  useEffect(() => {
    console.log('additional ----> ', data);
  }, [data]);

  return (
    <div>
      <Text size={24} color='primary'>
        Modification
      </Text>
      <Button
        onClick={() => engine.group()}
        color='primary'
        variant='contained'
      >
        Group
      </Button>
      <JSONViewer json={modifiers || []} />
    </div>
  );
}

function QueryForm(props: any) {
  const data = engine.useStore(props.dataSelector);

  useEffect(() => {
    console.log('queryable -----> ', data);
  }, [data]);

  return (
    <div className='flex fdc'>
      <Text size={24} color='primary'>
        Select Form
      </Text>
      <div>
        <Button
          onClick={() =>
            engine.search({
              q: 'run.hparams.batch_size > 32',
              p: 500,
            })
          }
          color='primary'
          variant='contained'
        >
          Search
        </Button>
      </div>
    </div>
  );
}

export default BasExplorer;
