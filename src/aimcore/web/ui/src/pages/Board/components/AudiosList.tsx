import * as React from 'react';

import AudioBox from 'components/AudioBox';

import pyodideEngine from 'services/pyodide/store';

function AudiosList(props: any) {
  const data = props.data.map((audio: any) => ({
    ...audio,
    ...audio.data,
    ...audio.audios,
    ...audio.record,
  }));

  const boxKey = (item: any) =>
    `${item?.container?.hash}_${item.name}_${JSON.stringify(item.context)}_${
      item.step
    }_${item.index}`;
  return (
    <div className='AudiosList' style={{ height: '100%', overflow: 'auto' }}>
      {data.map((item: any) => (
        <AudioBox
          key={boxKey(item)}
          blobData={item.blobs.data}
          format={item.format}
          caption={item.caption}
          name={item.name}
          context={item.context}
          step={item.step}
          index={item.index}
          engine={{
            events: pyodideEngine.events,
            blobURI: pyodideEngine.blobURI,
          }}
        />
      ))}
    </div>
  );
}

export default AudiosList;
