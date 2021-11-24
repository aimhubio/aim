import React from 'react';
import _ from 'lodash';
import { VariableSizeList as List, areEqual } from 'react-window';
import classNames from 'classnames';

import ImagesList from 'components/ImagesList';

import { formatValue } from 'utils/formatValue';

import { IImageSetProps } from './ImagesSet.d';

import './ImageSet.scss';

const imageWrapperHeight = 33;
const imageSetTitleHeight = 17;
const imageSetWrapperPaddingHeight = 6;

const ImagesSet = ({
  data,
  imagesBlobs,
  onScroll,
  addUriToList,
  index = 0,
  imagesSetKey,
  imageSetWrapperHeight,
  imageSetWrapperWidth,
  orderedMap,
  imageHeight,
  focusedState,
  syncHoverState,
}: IImageSetProps): React.FunctionComponentElement<React.ReactNode> => {
  let content: [string[], []][] = []; // the actual items list to be passed to virtualized list component
  let keysMap: { [key: string]: number } = {}; // cache for checking whether the group title is already added to list

  function fillContent(
    list: [] | { [key: string]: [] | {} },
    path = [''],
    orderedMap: { [key: string]: any },
  ) {
    if (Array.isArray(list)) {
      content.push([path, list]);
    } else {
      const fieldSortedValues = [...orderedMap.ordering].sort();
      fieldSortedValues.forEach((val: any) => {
        const fieldName = `${orderedMap.key} = ${formatValue(val)}`;
        if (!keysMap.hasOwnProperty(path.join(''))) {
          content.push([path, []]);
          keysMap[path.join('')] = 1;
        }
        fillContent(
          list[fieldName],
          path.concat([fieldName]),
          orderedMap[fieldName],
        );
      });
    }
  }

  fillContent(data, [''], orderedMap);

  function getItemSize(index: number) {
    let [path, items] = content[index];
    if (path.length === 1) {
      return 0;
    }

    if (items.length > 0) {
      return imageHeight + imageWrapperHeight;
    }

    return imageSetTitleHeight + imageSetWrapperPaddingHeight;
  }

  return (
    <List
      key={content.length}
      height={imageSetWrapperHeight || 0}
      itemCount={content.length}
      itemSize={getItemSize}
      width={'100%'}
      itemData={{
        data: content,
        imagesBlobs,
        onScroll,
        addUriToList,
        imageSetWrapperHeight,
        imageSetWrapperWidth,
        index,
        imagesSetKey,
        imageHeight,
        focusedState,
        syncHoverState,
      }}
    >
      {ImagesGroupedList}
    </List>
  );
};

function propsComparator(
  prevProps: IImageSetProps,
  nextProps: IImageSetProps,
): boolean {
  if (
    prevProps.imagesSetKey !== nextProps.imagesSetKey ||
    prevProps.focusedState !== nextProps.focusedState
  ) {
    return false;
  }

  return true;
}

export default React.memo(ImagesSet, propsComparator);

const ImagesGroupedList = React.memo(function ImagesGroupedList(props: any) {
  const { index, style, data } = props;
  const [path, items] = data.data[index];
  return (
    <div
      className='ImagesSet'
      style={{
        paddingLeft: `calc(0.625rem * ${path.length - 2})`,
        ...style,
      }}
    >
      {path.slice(2).map((key: string, i: number) => (
        <div
          key={key}
          className='ImagesSet__connectorLine'
          style={{
            left: `calc(0.625rem * ${i})`,
          }}
        />
      ))}
      <div className='ImagesSet__container'>
        {path.length > 1 && (
          <span
            className={classNames('ImagesSet__container__title', {
              withDash: path.length > 2,
            })}
          >
            {path[path.length - 1]}
          </span>
        )}
        {items.length > 0 && (
          <div className='ImagesSet__container__imagesBox'>
            <ImagesList
              data={items}
              imagesBlobs={data.imagesBlobs}
              onScroll={data.onScroll}
              addUriToList={data.addUriToList}
              imageSetWrapperWidth={data.imageSetWrapperWidth}
              imageHeight={data.imageHeight}
              focusedState={data.focusedState}
              syncHoverState={data.syncHoverState}
            />
          </div>
        )}
      </div>
    </div>
  );
}, areEqual);
