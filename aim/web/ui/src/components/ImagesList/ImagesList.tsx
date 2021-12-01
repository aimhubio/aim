import React from 'react';
import { shouldComponentUpdate, VariableSizeList as List } from 'react-window';

import { ImageAlignmentEnum } from 'config/enums/imageEnums';

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
  manipulations,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <List
      height={imageHeight}
      itemCount={data.length}
      itemSize={(index: number) => {
        return manipulations.alignmentType === ImageAlignmentEnum.Width
          ? (imageSetWrapperWidth * manipulations.imageSize) / 100
          : (imageHeight / data[index].height) * data[index].width;
      }}
      layout='horizontal'
      width={imageSetWrapperWidth}
      onScroll={onScroll}
      style={{ overflowY: 'hidden' }}
    >
      {({ style, index }) => {
        return (
          <ImageBox
            index={index}
            style={style}
            data={data[index]}
            imagesBlobs={imagesBlobs}
            addUriToList={addUriToList}
            imageHeight={imageHeight}
            focusedState={focusedState}
            syncHoverState={syncHoverState}
            manipulations={manipulations}
          />
        );
      }}
    </List>
  );
}

export default ImagesList;
