import * as React from 'react';

import { Skeleton } from '@material-ui/lab';

import { Text } from 'components/kit';

function ImagesList(props: any) {
  // let blobUriArray = React.useRef<string[]>([]);
  // let timeoutID = React.useRef(0);
  // const requestRef = React.useRef<any>();
  //
  // let [, setRenderKey] = React.useState(Date.now());

  const data = props.data.map((image: any) => ({
    ...image,
    ...image.data,
    ...image.images,
    ...image.record,
  }));

  // function addUriToList(blobUrl: string) {
  //   if (!blobsURIModel.getState()[blobUrl]) {
  //     blobUriArray.current.push(blobUrl);
  //     getBatch();
  //   }
  // }

  // function getBlobsData(uris: string[]) {
  //   const request = imagesExploreService.getImagesByURIs(uris);
  //   return {
  //     abort: request.abort,
  //     call: () => {
  //       return request
  //         .call()
  //         .then(async (stream) => {
  //           let bufferPairs = decodeBufferPairs(stream);
  //           let decodedPairs = decodePathsVals(bufferPairs);
  //           let objects = iterFoldTree(decodedPairs, 1);
  //           for await (let [keys, val] of objects) {
  //             const URI = keys[0];
  //             blobsURIModel.emit(URI as string, {
  //               [URI]: arrayBufferToBase64(val as ArrayBuffer) as string,
  //             });
  //           }
  //         })
  //         .catch((ex) => {
  //           if (ex.name === 'AbortError') {
  //             // Abort Error
  //           } else {
  //             // eslint-disable-next-line no-console
  //             console.log('Unhandled error: ');
  //           }
  //         });
  //     },
  //   };
  // }

  // const getBatch = _.throttle(() => {
  //   if (timeoutID.current) {
  //     window.clearTimeout(timeoutID.current);
  //   }
  //   timeoutID.current = window.setTimeout(() => {
  //     if (!_.isEmpty(blobUriArray.current)) {
  //       requestRef.current = getBlobsData(blobUriArray.current);
  //       requestRef.current.call().then(() => {
  //         blobUriArray.current = [];
  //       });
  //     }
  //   }, BATCH_SEND_DELAY);
  // }, BATCH_SEND_DELAY);

  // React.useEffect(() => {
  //   let timeoutID: number;

  //   let subscriptions: any[] = [];
  //   for (let i = 0; i < data.length; i++) {
  //     let image = data[i];
  //     if (!blobsURIModel.getState()[image.blob_uri]) {
  //       let subscription = blobsURIModel.subscribe(image.blob_uri, (data) => {
  //         setRenderKey(Date.now());
  //         subscription.unsubscribe();
  //       });
  //       timeoutID = window.setTimeout(() => {
  //         if (blobsURIModel.getState()[image.blob_uri]) {
  //           setRenderKey(Date.now());
  //           subscription.unsubscribe();
  //         } else {
  //           addUriToList(image.blob_uri);
  //         }
  //       }, BATCH_COLLECT_DELAY);

  //       subscriptions.push(subscription);
  //     }
  //   }

  //   return () => {
  //     if (timeoutID) {
  //       clearTimeout(timeoutID);
  //     }
  //     if (subscriptions) {
  //       subscriptions.forEach((sub: any) => sub.unsubscribe);
  //     }
  //   };
  // }, []);

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
            height: 'calc(100% - 10px)',
            flex: 1,
          }}
        >
          {/* {blobsURIModel.getState()[item.blob_uri] ? ( */}
          {item.data ? (
            <img
              style={{ maxHeight: '100%', maxWidth: '100%' }}
              src={`data:image/${item.format};base64, ${btoa(
                item.data.reduce(
                  (acc: any, current: any) =>
                    acc + String.fromCharCode(current),
                  '',
                ),
              )}`}
              alt={item.caption}
            />
          ) : (
            <div style={{ height: '100%' }}>
              <Skeleton variant='rect' height='100%' />
            </div>
          )}
          <Text size={10} weight={400}>
            {item.caption}
          </Text>
        </div>
      ))}
    </div>
  );
}

export default ImagesList;
