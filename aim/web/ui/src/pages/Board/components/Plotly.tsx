import * as React from 'react';

import Figures from 'modules/BaseExplorer/components/Figures/Figures';

function Plotly(props: any) {
  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
      }}
    >
      {/* @ts-ignore*/}
      <Figures
        data={{
          data: {
            data: props.data,
          },
        }}
        style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

export default Plotly;
