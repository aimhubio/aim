import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import { VariableSizeList as List } from 'react-window';
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
  console.log(imagesSetWrapper?.current?.offsetWidth);
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
          key={contextToString(data)?.length}
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
              key={title}
            >
              {({ style, index: listCounter }) => {
                const keyName = Object.keys(data)[listCounter];
                return (
                  <div style={style}>
                    <ImagesSet
                      data={data[keyName]}
                      title={keyName}
                      imagesBlobs={imagesBlobs}
                      onScroll={onScroll}
                      addUriToList={addUriToList}
                      imagesSetWrapper={imagesSetWrapper}
                      index={index + 1}
                      imagesSetKey={imagesSetKey}
                    />
                  </div>
                );
              }}
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
