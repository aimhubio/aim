import React from 'react';

import { getParams } from 'services/api/base-explorer/projectApi';

import { SequenceTypesEnum } from 'types/core/enums';

function BasExplorer() {
  const [status, setStatus] = React.useState('initial');
  const [data, setData] = React.useState({});

  function onClick() {
    setStatus('pending');
    getParams({ sequence: SequenceTypesEnum.Texts })
      .then((data) => {
        setStatus('succeed');
        setData(data);
      })
      .catch((err) => {
        alert(err.message);
        setData({});
        setStatus('failed');
      });
  }

  return (
    <>
      <h2>Status ::: {status}</h2>
      <button onClick={onClick}>Click to call params</button>
      <div>Data:::: {JSON.stringify(data)}</div>
    </>
  );
}

export default BasExplorer;
