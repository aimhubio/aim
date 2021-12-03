import React from 'react';
import { areEqual, VariableSizeList as List } from 'react-window';

import ImageBox from './ImageBox';

function ImagesList({
  data,
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
      itemData={{
        data,
        addUriToList,
        imageHeight,
        focusedState,
        syncHoverState,
      }}
    >
      {ImageBoxMemoized}
    </List>
  );
}

export default ImagesList;

const ImageBoxMemoized = React.memo(function ImageBoxMemoized(props: any) {
  const { index, style, data } = props;
  return (
    <ImageBox
      index={index}
      style={style}
      data={data.data[index]}
      addUriToList={data.addUriToList}
      imageHeight={data.imageHeight}
      focusedState={data.focusedState}
      syncHoverState={data.syncHoverState}
    />
  );
}, areEqual);
