import React from 'react';
import { VariableSizeList as List } from 'react-window';

import ImageBox from './ImageBox';

function ImagesList({
  data,
  imagesBlobs,
  onScroll,
  imageSetWrapperWidth,
  addUriToList,
  imageHeight,
  focusedState,
  syncHoverState,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <List
      height={imageHeight}
      itemCount={data.length}
      itemSize={(index: number) =>
        (imageHeight / data[index].height) * data[index].width
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
          imageHeight={imageHeight}
          focusedState={focusedState}
          syncHoverState={syncHoverState}
        />
      )}
    </List>
  );
}

export default React.memo(ImagesList);
