import * as React from 'react';
import * as _ from 'lodash-es';

import MediaList from 'components/MediaList';
import { MediaTypeEnum } from 'components/MediaPanel/config';

import { BATCH_SEND_DELAY } from 'config/mediaConfigs/mediaConfigs';

import blobsURIModel from 'services/models/media/blobsURIModel';
import imagesExploreService from 'services/api/imagesExplore/imagesExploreService';

import {
  decodeBufferPairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import arrayBufferToBase64 from 'utils/arrayBufferToBase64';

function ImagesList(props: any) {
  let blobUriArray = React.useRef<string[]>([]);
  let timeoutID = React.useRef(0);
  const requestRef = React.useRef<any>();

  const data = props.data.map((image: any) => ({
    ...image,
    ...image.data,
    ...image.images,
    ...image.record,
  }));

  function addUriToList(blobUrl: string) {
    if (!blobsURIModel.getState()[blobUrl]) {
      blobUriArray.current.push(blobUrl);
      getBatch();
    }
  }

  function getBlobsData(uris: string[]) {
    const request = imagesExploreService.getImagesByURIs(uris);
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

  const getBatch = _.throttle(() => {
    if (timeoutID.current) {
      window.clearTimeout(timeoutID.current);
    }
    timeoutID.current = window.setTimeout(() => {
      if (!_.isEmpty(blobUriArray.current)) {
        requestRef.current = getBlobsData(blobUriArray.current);
        requestRef.current.call().then(() => {
          blobUriArray.current = [];
        });
      }
    }, BATCH_SEND_DELAY);
  }, BATCH_SEND_DELAY);

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
      }}
    >
      <MediaList
        data={data}
        wrapperOffsetWidth={900}
        addUriToList={addUriToList}
        wrapperOffsetHeight={400}
        mediaItemHeight={400}
        focusedState={{ active: false, key: null }}
        mediaType={MediaTypeEnum.IMAGE}
        selectOptions={[]}
        onRunsTagsChange={() => null}
        additionalProperties={{
          alignmentType: 'Height',
          mediaItemSize: 100,
          imageRendering: 'smooth',
          stacking: false,
        }}
      />
    </div>
  );
}

export default ImagesList;
