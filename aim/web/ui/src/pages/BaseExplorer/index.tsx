import React from 'react';

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
    setStatus('executing pipeline');
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
        setStatus('pipeline execution succeed');
        console.log(data);
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
      <div>
        Params:::: {JSON.stringify(data.params)}
        <br />
        Contexts:::: {JSON.stringify(data.contexts)}
        <br />
        Modifier values:::: {JSON.stringify(data.modifiers)}
        <br />
        data:::: {JSON.stringify(data?.objectList?.slice(0, 5))}
      </div>
    </>
  );
}

export default BasExplorer;
