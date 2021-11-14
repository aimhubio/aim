import React from 'react';
import { VariableSizeList as List } from 'react-window';

import { imageFixedHeight } from 'config/imagesConfigs/imagesConfig';

import ImageBox from './ImageBox';

function ImagesList({
  data,
  imagesBlobs,
  onScroll,
  imageSetWrapperWidth,
  addUriToList,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <List
      height={imageFixedHeight}
      itemCount={data.length}
      itemSize={(index: number) =>
        (imageFixedHeight / data[index].height) * data[index].width
      }
      layout='horizontal'
      width={imageSetWrapperWidth || 0}
      onScroll={onScroll}
      style={{ overflowY: 'hidden' }}
    >
      {({ style, index }) => (
        <ImageBox
          index={index}
          style={style}
          data={data[index]}
          imagesBlobs={imagesBlobs}
          addUriToList={addUriToList}
        />
      )}
    </List>
  );
}

export default React.memo(ImagesList);
