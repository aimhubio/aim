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

  const boxKey = (item: any) =>
    `${item?.container?.hash}_${item.name}_${JSON.stringify(item.context)}_${
      item.step
    }_${item.index}`;
  return (
    <div className='ImagesList' style={{ height: '100%', overflow: 'auto' }}>
      {data.map((item: any) => (
        <ImageBox
          key={boxKey(item)}
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
