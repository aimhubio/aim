import * as React from 'react';

import DataTable from '../DataTable';

function DataFrameVizElement(props: any) {
  const data =
    typeof props.data === 'string' ? JSON.parse(props.data) : props.data;
  return <DataTable data={data} />;
}
export default DataFrameVizElement;
