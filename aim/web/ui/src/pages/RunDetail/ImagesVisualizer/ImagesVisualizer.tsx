import React, { memo } from 'react';

import { MediaTypeEnum } from 'components/MediaPanel/config';
import MediaPanel from 'components/MediaPanel';

import {
  ImageRenderingEnum,
  MediaItemAlignmentEnum,
} from 'config/enums/imageEnums';

import useResizeObserver from 'hooks/window/useResizeObserver';

import blobsURIModel from 'services/models/media/blobsURIModel';
import imagesExploreService from 'services/api/imagesExplore/imagesExploreService';

import {
  adjustable_reader,
  decodePathsVals,
  decode_buffer_pairs,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import arrayBufferToBase64 from 'utils/arrayBufferToBase64';

import { IImagesVisualizerProps } from '../types';

import './ImagesVisualizer.scss';

function ImagesVisualizer(
  props: IImagesVisualizerProps | any,
): React.FunctionComponentElement<React.ReactNode> {
  const { data, isLoading } = props;
  const imagesWrapperRef = React.useRef<any>(null);
  const [focusedState, setFocusedState] = React.useState({
    active: false,
    key: null,
  });
  const [offsetHeight, setOffsetHeight] = React.useState(
    imagesWrapperRef?.current?.offsetHeight,
  );
  const [offsetWidth, setOffsetWidth] = React.useState(
    imagesWrapperRef?.current?.offsetWidth,
  );

  useResizeObserver(
    () => setOffsetWidth(imagesWrapperRef?.current?.offsetWidth),
    imagesWrapperRef,
  );

  React.useEffect(() => {
    blobsURIModel.init();
  }, []);

  React.useEffect(() => {
    setOffsetHeight(imagesWrapperRef?.current?.offsetHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesWrapperRef?.current?.offsetHeight]);

  function getImagesBlobsData(uris: string[]) {
    const request = imagesExploreService.getImagesByURIs(uris);
    return {
      abort: request.abort,
      call: () => {
        return request
          .call()
          .then(async (stream) => {
            let gen = adjustable_reader(stream);
            let buffer_pairs = decode_buffer_pairs(gen);
            let decodedPairs = decodePathsVals(buffer_pairs);
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
              console.log('Unhandled error: ');
            }
          });
      },
    };
  }

  const onActivePointChange = React.useCallback(
    (activePoint: any, focusedStateActive: boolean = false) => {
      setFocusedState({ key: activePoint.key, active: focusedStateActive });
    },
    [],
  );

  const additionalProperties = React.useMemo(() => {
    return {
      alignmentType: MediaItemAlignmentEnum.Height,
      mediaItemSize: 25,
      imageRendering: ImageRenderingEnum.Pixelated,
    };
  }, []);

  return (
    <div className='ImagesVisualizer' ref={imagesWrapperRef}>
      <MediaPanel
        mediaType={MediaTypeEnum.IMAGE}
        getBlobsData={getImagesBlobsData}
        data={data?.imageSetData}
        orderedMap={data?.orderedMap}
        isLoading={!data || isLoading}
        panelResizing={false}
        tableHeight={'0'}
        wrapperOffsetHeight={offsetHeight || 0}
        wrapperOffsetWidth={offsetWidth || 0}
        focusedState={focusedState}
        additionalProperties={additionalProperties}
        onActivePointChange={onActivePointChange}
      />
    </div>
  );
}

ImagesVisualizer.displayName = 'ImagesVisualizer';

export default memo<IImagesVisualizerProps>(ImagesVisualizer);
