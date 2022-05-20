import React from 'react';
// @ts-ignore
import JSONViewer from 'react-json-viewer';

import createPipeline from 'modules/BaseExplorerCore/pipeline';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

const pipeline = createPipeline({
  sequenceName: SequenceTypesEnum.Images,
  query: {
    useCache: true,
  },
  adapter: {
    useCache: true,
    objectDepth: AimObjectDepths.Index,
  },
});

function BasExplorer() {
  const [status, setStatus] = React.useState('initial');
  const [data, setData] = React.useState<any>([]);

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

  return (
    <>
      <h2>Status ::: {status}</h2>
      <button onClick={onClick}>Click to call params</button>
      <div className='flex '>
        <div>
          Params <JSONViewer json={data.params || []} />
        </div>
        <div>
          Contexts <JSONViewer json={data.contexts || []} />
        </div>
        <div>
          Modifiers <JSONViewer json={data.modifiers || []} />
        </div>
      </div>
      <div style={{ maxWidth: '100vw' }}>
        Visualization <JSONViewer json={data?.objectList?.slice(0, 10) || []} />
      </div>
    </>
  );
}

export default BasExplorer;
