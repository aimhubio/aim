import React from 'react';

import { searchRuns } from 'services/api/base-explorer/runsApi';

import { SequenceTypesEnum } from 'types/core/enums';

import { parseStream } from 'utils/encoder/streamEncoding';

function BasExplorer() {
  const [status, setStatus] = React.useState('initial');
  const [data, setData] = React.useState<Array<any>>([]);
  console.log(status);

  function onClick() {
    setStatus('pending');
    searchRuns(SequenceTypesEnum.Metric, {
      p: 500,
      q: 'run.hparams.batch_size > 10',
    })
      .then(async (data) => {
        setStatus('encoding');
        const streamData = await parseStream(data);
        console.log(streamData);
        setStatus('succeed');
        setData(streamData);
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
