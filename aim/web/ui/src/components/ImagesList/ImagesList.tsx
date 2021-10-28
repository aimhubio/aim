import React, { memo, useEffect, useState } from 'react';
import { VariableSizeList as List } from 'react-window';

import ImageBox from './ImageBox';

function ImagesList({
  data,
  imagesBlobs,
  onScroll,
  imagesBoxRef,
  addUriToList,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const [listHeight, setListHeight] = useState<number>(0);

  useEffect(() => {
    setListHeight(
      data.reduce((acc: number, { height }: { height: number }) => {
        if (height > acc) {
          acc = height;
        }
        return acc;
      }, 0),
    );
  }, [data]);

  return (
    <List
      height={listHeight}
      itemCount={data.length}
      itemSize={(index: number) => data[index].width + 10}
      layout='horizontal'
      width={imagesBoxRef.current.offsetWidth || 0}
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

export default memo(ImagesList);
