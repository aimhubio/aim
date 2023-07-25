import * as React from 'react';

import Figure from 'modules/BaseExplorer/components/Figure';

function FiguresList(props: any) {
  console.log(props.data);
  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
      }}
    >
      {props.data.map((item: any, i: number) => (
        <div
          key={i}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 5,
          }}
        >
          <Figure
            data={{ data: item }}
            style={{
              display: 'flex',
              flex: 1,
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default FiguresList;
