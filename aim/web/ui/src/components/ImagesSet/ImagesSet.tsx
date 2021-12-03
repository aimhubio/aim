import React from 'react';
import _ from 'lodash';
import { VariableSizeList as List, areEqual } from 'react-window';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ImagesList from 'components/ImagesList';
import { JsonViewPopover } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';

import { formatValue } from 'utils/formatValue';
import { jsonParse } from 'utils/jsonParse';

import { IImageSetProps } from './ImagesSet.d';

import './ImageSet.scss';

const imageWrapperHeight = 33;
const imageSetTitleHeight = 17;
const imageSetWrapperPaddingHeight = 6;

const ImagesSet = ({
  data,
  onListScroll,
  addUriToList,
  index = 0,
  imagesSetKey,
  imageSetWrapperHeight,
  imageSetWrapperWidth,
  orderedMap,
  imageHeight,
  focusedState,
  syncHoverState,
  hoveredImageKey,
  setImageFullMode,
  setImageFullModeData,
  imageProperties,
  tableHeight,
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
      const fieldSortedValues = _.sortBy([...orderedMap.ordering]);
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
      key={content.length + tableHeight + imageProperties?.imageSize}
      height={imageSetWrapperHeight || 0}
      itemCount={content.length}
      itemSize={getItemSize}
      width={'100%'}
      onScroll={onListScroll}
      itemData={{
        data: content,
        addUriToList,
        imageSetWrapperHeight,
        imageSetWrapperWidth,
        index,
        imagesSetKey,
        imageHeight,
        focusedState,
        syncHoverState,
        hoveredImageKey,
        setImageFullMode,
        setImageFullModeData,
        imageProperties,
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
    prevProps.focusedState !== nextProps.focusedState ||
    prevProps.hoveredImageKey !== nextProps.hoveredImageKey
  ) {
    return false;
  }
  return true;
}

export default React.memo(ImagesSet, propsComparator);

const ImagesGroupedList = React.memo(function ImagesGroupedList(props: any) {
  const { index, style, data } = props;
  const [path, items] = data.data[index];
  const json: string | object = jsonParse(
    path[path.length - 1]?.split('=')[1]?.trim(),
  );
  const isJson: boolean = typeof json === 'object';

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
      <div
        className={`ImagesSet__container ${path.length > 2 ? 'withDash' : ''}`}
      >
        {path.length > 1 && (
          <ControlPopover
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            anchor={({ onAnchorClick }) => (
              <Tooltip
                placement='top-start'
                title={isJson ? path[path.length - 1] : ''}
              >
                <span
                  onClick={isJson ? onAnchorClick : () => null}
                  className={classNames(
                    `ImagesSet__container__title ${
                      isJson ? 'ImagesSet__container__title__pointer' : ''
                    }`,
                  )}
                >
                  {path[path.length - 1]}
                </span>
              </Tooltip>
            )}
            component={<JsonViewPopover json={json as object} />}
          />
        )}
        {items.length > 0 && (
          <div className='ImagesSet__container__imagesBox'>
            <ImagesList
              data={items}
              addUriToList={data.addUriToList}
              imageSetWrapperWidth={data.imageSetWrapperWidth}
              imageHeight={data.imageHeight}
              focusedState={data.focusedState}
              syncHoverState={data.syncHoverState}
              hoveredImageKey={data.hoveredImageKey}
              setImageFullMode={data.setImageFullMode}
              setImageFullModeData={data.setImageFullModeData}
              imageProperties={data.imageProperties}
            />
          </div>
        )}
      </div>
    </div>
  );
}, areEqual);
