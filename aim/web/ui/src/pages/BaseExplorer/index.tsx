import React from 'react';
// @ts-ignore
import JSONViewer from 'react-json-viewer';

import createPipeline from 'modules/BaseExplorerCore/pipeline';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import useParamsSuggestions from '../../hooks/projectData/useParamsSuggestions';
import { Text, Button } from '../../components/kit';

import Modifiers from './Modifiers';

const pipeline = createPipeline({
  sequenceName: SequenceTypesEnum.Images,
  query: {
    useCache: true,
  },
  adapter: {
    useCache: true,
    objectDepth: AimObjectDepths.Index,
  },
  modifier: {
    useCache: true,
  },
});

function BasExplorer() {
  const [status, setStatus] = React.useState('initial');
  const [data, setData] = React.useState<any>(null);
  // const suggestions = useParamsSuggestions();
  function onClick() {
    setStatus('pipeline-execution-start');
    pipeline
      .execute({
        query: {
          params: {
            p: 500,
            q: 'run.hparams.batch_size > 10',
          },
        },
      })
      .then((data) => {
        setStatus('pipeline-execution-succeed');
        setData(data);
      })
      .catch((err) => {
        console.log(err);
        setStatus('pipeline execution failed');
      });
  }

  function onChange(d: any) {
    console.log(d);
  }
  return (
    <div style={{ width: '100%', height: '100vh', padding: '10px' }}>
      <h2>Status ::: {status}</h2>
      <div className='flex fjc fac' style={{ marginTop: 10 }}>
        <Button onClick={onClick} color='primary' variant='contained'>
          Search
        </Button>
        {data && (
          <Modifiers
            data={data?.additionalData?.modifiers}
            onChange={onChange}
          />
        )}
      </div>

      <div style={{ maxWidth: '100vw' }}>
        <Text size={24} weight={600}>
          Visualization
        </Text>
        <JSONViewer json={data?.data?.slice(0, 10) || []} />
      </div>
    </div>
  );
}

export default BasExplorer;
