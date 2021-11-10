import React from 'react';
import _ from 'lodash';
import { VariableSizeList as List, areEqual } from 'react-window';
import classNames from 'classnames';

import ImagesList from 'components/ImagesList';

import { imageFixedHeight } from 'config/imagesConfigs/imagesConfig';

import contextToString from 'utils/contextToString';

import { IImageSetProps } from './ImagesSet.d';

import './ImageSet.scss';

const ImagesSet = ({
  data,
  title,
  imagesBlobs,
  onScroll,
  addUriToList,
  index = 0,
  imagesSetWrapper,
  imagesSetKey,
}: IImageSetProps): React.FunctionComponentElement<React.ReactNode> => {
  const getItemSize = (index: number) => {
    const imagesHeights: any = getNestedDataHeight(
      _.isArray(Object.values(data)[index])
        ? [Object.values(data)[index]]
        : Object.values(data)[index],
    );
    return imagesHeights + (_.isArray(Object.values(data)[index]) ? 20 : 40);
  };

  function getNestedDataHeight(data: any): number {
    let objectData = !_.isArray(data[0]) ? Object.values(data) : data;
    const calculatedHeight = objectData.reduce((acc: number, item: any) => {
      if (!_.isArray(item)) {
        acc += 23 + getNestedDataHeight(item);
      } else {
        acc += 27 + imageFixedHeight;
      }
      return acc;
    }, 0);

    return calculatedHeight;
  }

  return (
    <div className={classNames('ImagesSet', { withLeftBorder: index > 1 })}>
      {Array.isArray(data) ? (
        <div className='ImagesSet__container'>
          {index !== 0 && (
            <span className='ImagesSet__container__title'>{title}</span>
          )}
          <div className='ImagesSet__container__imagesBox'>
            <ImagesList
              data={data}
              imagesBlobs={imagesBlobs}
              onScroll={onScroll}
              addUriToList={addUriToList}
              imagesSetWrapper={imagesSetWrapper}
              index={index + 1}
            />
          </div>
        </div>
      ) : (
        <div
          className='ImagesSet__container'
          // key={contextToString(data)?.length}
        >
          {index !== 0 && (
            <p className='ImagesSet__container__title'>{title}</p>
          )}
          {index === 0 ? (
            <List
              height={imagesSetWrapper?.current?.offsetHeight || 0}
              itemCount={Object.keys(data).length}
              itemSize={getItemSize}
              width={'100%'}
              itemData={{
                data,
                imagesBlobs,
                onScroll,
                addUriToList,
                imagesSetWrapper,
                index,
                imagesSetKey,
              }}
            >
              {ImagesGroupedList}
            </List>
          ) : (
            Object.keys(data).map((keyName, key) => (
              <ImagesSet
                key={key}
                data={data[keyName]}
                title={keyName}
                imagesBlobs={imagesBlobs}
                onScroll={onScroll}
                addUriToList={addUriToList}
                imagesSetWrapper={imagesSetWrapper}
                index={index + 1}
                imagesSetKey={imagesSetKey}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

function propsComparator(
  prevProps: IImageSetProps,
  nextProps: IImageSetProps,
): boolean {
  if (prevProps.imagesSetKey !== nextProps.imagesSetKey) {
    return false;
  }

  return true;
}

export default React.memo(ImagesSet, propsComparator);

const ImagesGroupedList = React.memo(function ImagesGroupedList(props: any) {
  const { index, style, data } = props;
  const keyName = Object.keys(data.data)[index];

  return (
    <div style={style}>
      <ImagesSet
        data={data.data[keyName]}
        title={keyName}
        imagesBlobs={data.imagesBlobs}
        onScroll={data.onScroll}
        addUriToList={data.addUriToList}
        imagesSetWrapper={data.imagesSetWrapper}
        index={data.index + 1}
        imagesSetKey={data.imagesSetKey}
      />
    </div>
  );
}, areEqual);
