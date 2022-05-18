import React from 'react';

import createQuery from 'modules/BaseExplorerCore/pipeline/query';

import { SequenceTypesEnum } from 'types/core/enums';

const query = createQuery(SequenceTypesEnum.Metric);

function BasExplorer() {
  const [status, setStatus] = React.useState('initial');
  const [data, setData] = React.useState<any>([]);
  console.log(status);

  function onClick() {
    setStatus('pending');
    query
      .execute({
        p: 500,
        q: 'run.hparams.batch_size > 10',
      })
      .then((data) => {
        console.log(data);
        setStatus('succeed');
        setData(data);
      })
      .catch((err) => {
        alert(err.message);
        setData([]);
        setStatus('failed');
      });
  }

  return (
    <>
      <h2>Status ::: {status}</h2>
      <button onClick={onClick}>Click to call params</button>
      <div>Data:::: {JSON.stringify(data[0])}</div>
    </>
  );
}

export default BasExplorer;
