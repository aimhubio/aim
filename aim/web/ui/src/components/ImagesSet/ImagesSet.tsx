import React, { useRef } from 'react';
import _ from 'lodash';
import { VariableSizeList as List } from 'react-window';

import contextToString from 'utils/contextToString';
import ImagesList from 'components/ImagesList';
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
}: IImageSetProps): React.FunctionComponentElement<React.ReactNode> => {
  const imagesBoxRef = useRef<any>({});

  const getItemSize = (index: number) => {
    const imagesHeights: any = getNestedDataHeight(
      _.isArray(Object.values(data)[index])
        ? [Object.values(data)[index]]
        : Object.values(data)[index],
    );
    return imagesHeights + (_.isArray(Object.values(data)[index]) ? 21 : 46);
  };

  function getNestedDataHeight(data: any): number {
    let objectData = !_.isArray(data[0]) ? Object.values(data) : data;
    const calculatedHeight = objectData.reduce((acc: number, item: any) => {
      if (!_.isArray(item)) {
        acc += 46 + getNestedDataHeight(item);
      } else {
        let height = 0;
        item.forEach((image) => {
          if (height < image.height) {
            height = image.height;
          }
        });
        acc += 46 + height;
      }
      return acc;
    }, 0);

    return calculatedHeight;
  }

  return (
    <div className='ImagesSet'>
      {Array.isArray(data) ? (
        <div className='ImagesSet__container'>
          <span className='ImagesSet__container__title'>{title}</span>
          <div className='ImagesSet__container__imagesBox' ref={imagesBoxRef}>
            <ImagesList
              data={data}
              imagesBlobs={imagesBlobs}
              onScroll={onScroll}
              imagesBoxRef={imagesBoxRef}
              addUriToList={addUriToList}
              index={index + 1}
            />
          </div>
        </div>
      ) : (
        <div
          className='ImagesSet__container'
          key={contextToString(data)?.length}
        >
          <p className='ImagesSet__container__title'>{title}</p>
          {index === 0 ? (
            <List
              height={imagesSetWrapper?.current?.offsetHeight || 0}
              itemCount={Object.keys(data).length}
              itemSize={getItemSize}
              width={'100%'}
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
                      index={index + 1}
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
                index={index + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ImagesSet);
