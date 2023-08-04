import * as React from 'react';

import FigureBox from 'components/FigureBox';

import pyodideEngine from 'services/pyodide/store';

function FiguresList(props: any) {
  const data = props.data.map((figure: any) => ({
    ...figure,
    ...figure.data,
    ...figure.figures,
    ...figure.record,
  }));

  const boxKey = (item: any) =>
    `${item?.container?.hash}_${item.name}_${JSON.stringify(item.context)}_${
      item.step
    }`;
  return (
    <div className='FiguresList' style={{ height: '100%', overflow: 'auto' }}>
      {data.map((item: any) => (
        <FigureBox
          key={boxKey(item)}
          blobData={item.blobs.data}
          format={item.format}
          name={item.name}
          context={item.context}
          step={item.step}
          engine={{
            blobURI: pyodideEngine.blobURI,
          }}
        />
      ))}
    </div>
  );
}

export default FiguresList;
