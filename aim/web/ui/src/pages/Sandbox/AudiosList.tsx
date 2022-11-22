import * as React from 'react';

import AudioBox from 'components/kit/AudioBox';

import blobsURIModel from 'services/models/media/blobsURIModel';
import audiosExploreService from 'services/api/audiosExplore/audiosExplore';

import {
  decodeBufferPairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import arrayBufferToBase64 from 'utils/arrayBufferToBase64';

function AudiosList(props: any) {
  const data = props.data.map((audio: any) => ({
    ...audio,
    ...audio.data,
    ...audio.audios,
    ...audio.record,
  }));

  function getBlobsData(uris: string[]) {
    const request = audiosExploreService.getAudiosByURIs(uris);
    return {
      abort: request.abort,
      call: () => {
        return request
          .call()
          .then(async (stream) => {
            let bufferPairs = decodeBufferPairs(stream);
            let decodedPairs = decodePathsVals(bufferPairs);
            let objects = iterFoldTree(decodedPairs, 1);
            for await (let [keys, val] of objects) {
              const URI = keys[0];
              blobsURIModel.emit(URI as string, {
                [URI]: arrayBufferToBase64(val as ArrayBuffer) as string,
              });
            }
          })
          .catch((ex) => {
            if (ex.name === 'AbortError') {
              // Abort Error
            } else {
              // eslint-disable-next-line no-console
              console.log('Unhandled error: ');
            }
          });
      },
    };
  }

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
      }}
    >
      {data.map((item: any, i: number) => (
        <div
          key={i}
          style={{
            margin: '5px',
            height: 50,
            width: 'calc(100% - 10px)',
            flex: 1,
          }}
        >
          <AudioBox
            data={item}
            style={{}}
            additionalProperties={{ getAudiosBlobsData: getBlobsData }}
          />
        </div>
      ))}
    </div>
  );
}

export default AudiosList;
