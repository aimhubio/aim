import React from 'react';
import { areEqual, VariableSizeList as List } from 'react-window';

import { ImageAlignmentEnum } from 'config/enums/imageEnums';

import ImageBox from './ImageBox';

function ImagesList({
  data,
  imageSetWrapperWidth,
  addUriToList,
  imageHeight,
  focusedState,
  syncHoverState,
  hoveredImageKey,
  setImageFullMode,
  setImageFullModeData,
  imageProperties,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <List
      height={imageHeight}
      itemCount={data.length}
      itemSize={(index: number) => {
        return imageProperties?.alignmentType === ImageAlignmentEnum.Width
          ? (imageSetWrapperWidth * imageProperties?.imageSize) / 100
          : (imageHeight / data[index].height) * data[index].width;
      }}
      layout='horizontal'
      width={imageSetWrapperWidth}
      style={{ overflowY: 'hidden' }}
      itemData={{
        data,
        addUriToList,
        imageHeight,
        focusedState,
        syncHoverState,
        hoveredImageKey,
        setImageFullMode,
        setImageFullModeData,
        imageProperties,
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
      hoveredImageKey={data.hoveredImageKey}
      setImageFullMode={data.setImageFullMode}
      setImageFullModeData={data.setImageFullModeData}
      imageProperties={data.imageProperties}
    />
  );
}, areEqual);
