import * as React from 'react';

import ImageBox from 'components/ImageBox';

import pyodideEngine from 'services/pyodide/store';

function ImagesList(props: any) {
  const data = props.data.map((image: any) => ({
    ...image,
    ...image.data,
    ...image.images,
    ...image.record,
  }));

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {data.map((item: any, i: number) => (
        <ImageBox
          key={`${item.blobs.data}-${i}`}
          style={{
            margin: '5px',
            height: 'calc(100% - 10px)',
            flex: 1,
          }}
          blobData={item.blobs.data}
          format={item.format}
          caption={item.caption}
          name={item.name}
          context={item.context}
          step={item.step}
          index={item.index}
          engine={{
            blobURI: pyodideEngine.blobURI,
          }}
        />
      ))}
    </div>
  );
}

export default ImagesList;
