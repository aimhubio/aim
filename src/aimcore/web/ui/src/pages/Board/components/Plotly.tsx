import * as React from 'react';

import Figures from 'modules/BaseExplorer/components/Figure/Figure';

function Plotly(props: any) {
  return (
    <div
      style={{
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Figures
        data={{
          data: {
            data: props.data,
          },
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

export default Plotly;
