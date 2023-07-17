import * as React from 'react';

import AudioBox from 'components/kit/AudioBox';

import pyodideEngine from 'services/pyodide/store';

function AudiosList(props: any) {
  const data = props.data.map((audio: any) => ({
    ...audio,
    ...audio.data,
    ...audio.audios,
    ...audio.record,
  }));

  return (
    <div className='AudiosList' style={{ height: '100%', overflow: 'auto' }}>
      {data.map((item: any, i: number) => (
        <AudioBox
          key={`${item?.container?.hash}_${item.name}_${JSON.stringify(
            item.context,
          )}_${item.step}_${item.index}`}
          style={{
            margin: '5px',
            height: 50,
            width: 'calc(100% - 10px)',
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
            events: pyodideEngine.events,
            blobURI: pyodideEngine.blobURI,
          }}
        />
      ))}
    </div>
  );
}

export default AudiosList;
