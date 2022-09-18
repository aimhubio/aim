import * as React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import CopyToClipBoard from 'components/CopyToClipBoard/CopyToClipBoard';

import { formatValue } from 'utils/formatValue';
import { encode } from 'utils/encoder/encoder';

import Text from '../Text';
import Icon from '../Icon';

import {
  IDictVisualizerProps,
  DictVisualizerRowType,
  IDictVisualizerRowProps,
} from './DictVisualizer.d';

import './DictVisualizer.scss';

//returns a string "type" of input object
export function toType(obj: any) {
  let type = getType(obj);
  // some extra disambiguation for numbers
  if (type === 'number') {
    if (isNaN(obj)) {
      type = 'nan';
    } else if ((obj | 0) !== obj) {
      //bitwise OR produces integers
      type = 'float';
    } else {
      type = 'int';
    }
  } else if (type === 'boolean') {
    type = 'bool';
  } else if (type === 'undefined' || type === 'null') {
    type = '';
  }

  return type;
}

//source: http://stackoverflow.com/questions/7390426/better-way-to-get-type-of-a-javascript-variable/7390612#7390612
function getType(obj: any) {
  return ({} as any).toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase();
}

function typeToColor(item: any) {
  switch (item) {
    case 'int':
      return 'rgb(175, 85, 45)';
    case 'float':
      return 'rgb(92, 129, 21)';
    case 'string':
      return 'rgb(246, 103, 30)';
    case 'bool':
      return 'rgb(169, 87, 153)';
    case 'object':
      return 'rgb(73, 72, 73)';
    case 'array':
      return 'rgb(73, 72, 73)';
    case '':
      return 'rgb(148, 148, 148)';
    default:
      return 'rgb(20, 115, 230)';
  }
}

function DictVisualizer(props: IDictVisualizerProps) {
  const [collapsedItems, setCollapsedItems] = React.useState<{
    [key: string]: boolean;
  }>({});
  const flattenDict = React.useCallback(
    (
      dict: { [key: string]: unknown } | unknown[],
      level: number = 0,
      parentKey: string = 'root',
    ) => {
      let rows: DictVisualizerRowType[] = [];
      if (level === 0) {
        if (Array.isArray(dict)) {
          let nestedItemsLength = dict.length;
          rows.push({
            id: parentKey,
            root: nestedItemsLength > 0,
            level,
            key: null,
            value: `[${
              nestedItemsLength === 0
                ? ']'
                : collapsedItems[parentKey]
                ? '...]'
                : ''
            }`,
            sub: `${nestedItemsLength} item${
              nestedItemsLength === 1 ? '' : 's'
            }`,
            color: typeToColor('array'),
            copyContent: formatValue(dict),
          });
        } else {
          let nestedItemsLength = Object.keys(dict).length;
          rows.push({
            id: parentKey,
            root: nestedItemsLength > 0,
            level,
            key: null,
            value: `{${
              nestedItemsLength === 0
                ? '}'
                : collapsedItems[parentKey]
                ? '...}'
                : ''
            }`,
            sub: `${nestedItemsLength} item${
              nestedItemsLength === 1 ? '' : 's'
            }`,
            color: typeToColor('object'),
            copyContent: formatValue(dict),
          });
        }
      }
      if (!collapsedItems[parentKey]) {
        for (let key in dict) {
          let item: unknown = Array.isArray(dict) ? dict[+key] : dict[key];
          let type = toType(item);
          let color = typeToColor(type);
          let id = encode({
            parent: parentKey,
            key,
          });
          const value = formatValue(item);
          if (Array.isArray(item)) {
            rows.push({
              id,
              root: item.length > 0,
              level,
              key: formatValue(key),
              value: `[${
                item.length === 0 ? ']' : collapsedItems[id] ? '...]' : ''
              }`,
              sub: `${item.length} item${item.length === 1 ? '' : 's'}`,
              color: typeToColor('array'),
              copyContent: value,
            });
            if (!collapsedItems[id] && item.length > 0) {
              rows.push(...flattenDict(item as unknown[], level + 1, id));
              rows.push({
                id,
                level,
                key: null,
                value: ']',
                sub: null,
                color: typeToColor('array'),
              });
            }
          } else if (typeof item === 'object' && item !== null) {
            let nestedItemsLength = Object.keys(item).length;
            rows.push({
              id,
              root: nestedItemsLength > 0,
              level,
              key: formatValue(key),
              value: `{${
                nestedItemsLength === 0 ? '}' : collapsedItems[id] ? '...}' : ''
              }`,
              sub: `${nestedItemsLength} item${
                nestedItemsLength === 1 ? '' : 's'
              }`,
              color: typeToColor('object'),
              copyContent: value,
            });
            if (!collapsedItems[id] && nestedItemsLength > 0) {
              rows.push(
                ...flattenDict(
                  item as { [key: string]: unknown },
                  level + 1,
                  id,
                ),
              );
              rows.push({
                id,
                level,
                key: null,
                value: '}',
                sub: null,
                color: typeToColor('object'),
              });
            }
          } else {
            rows.push({
              id,
              level,
              key: Array.isArray(dict) ? +key : formatValue(key),
              value,
              sub: type === '' ? null : type,
              color,
              copyContent: value,
            });
          }
        }

        if (level === 0) {
          if (Array.isArray(dict)) {
            rows.push({
              id: parentKey,
              level,
              key: null,
              value: ']',
              sub: null,
              color: typeToColor('array'),
            });
          } else {
            rows.push({
              id: parentKey,
              level,
              key: null,
              value: '}',
              sub: null,
              color: typeToColor('object'),
            });
          }
        }
      }

      return rows;
    },
    [collapsedItems],
  );

  const rows = React.useMemo(() => {
    return flattenDict(props.src as { [key: string]: unknown });
  }, [props.src, flattenDict]);

  function collapseToggler(id: string) {
    setCollapsedItems((cI) => ({
      ...cI,
      [id]: !cI[id],
    }));
  }

  return (
    <ErrorBoundary>
      <div style={props.style} className='DictVisualizer'>
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              itemCount={rows.length}
              itemSize={22}
            >
              {({ index, style }: ListChildComponentProps) => {
                const row = rows[index];
                return (
                  <DictVisualizerRow
                    row={row}
                    index={index}
                    style={style}
                    collapseToggler={collapseToggler}
                    isCollapsed={collapsedItems[row.id]}
                    rowsCount={rows.length}
                  />
                );
              }}
            </List>
          )}
        </AutoSizer>
      </div>
    </ErrorBoundary>
  );
}

function DictVisualizerRow(props: IDictVisualizerRowProps) {
  const { row, style, index, collapseToggler, isCollapsed, rowsCount } = props;

  return (
    <div key={row.key} className='DictVisualizer__row' style={style}>
      {index !== 0 &&
        index !== rowsCount - 1 &&
        Array(row.level + 1)
          .fill('_')
          .map((_, i) => (
            <div key={i} className='DictVisualizer__row__indent' />
          ))}
      {row.root && (
        <div
          className='DictVisualizer__row__collapseToggler'
          onClick={() => collapseToggler(row.id)}
        >
          <Icon
            name={isCollapsed ? 'arrow-right' : 'arrow-down'}
            fontSize={9}
          />
        </div>
      )}
      <div className='DictVisualizer__row__content'>
        {row.key !== null && (
          <Text size={16} className='DictVisualizer__row__content__key'>
            {row.key}:
          </Text>
        )}
        {row.sub !== null && (
          <Text
            size={12}
            className='DictVisualizer__row__content__sub'
            style={{ color: row.color }}
          >
            {row.sub}
          </Text>
        )}
        <Text
          size={16}
          className='DictVisualizer__row__content__value'
          style={{
            color: row.color,
            cursor: isCollapsed ? 'pointer' : '',
          }}
          onClick={isCollapsed ? () => collapseToggler(row.id) : undefined}
        >
          {row.value as string}
        </Text>
      </div>
      {row.copyContent && (
        <CopyToClipBoard
          className='DictVisualizer__row__copy'
          iconSize='xSmall'
          copyContent={row.copyContent}
        />
      )}
    </div>
  );
}

DictVisualizer.displayName = 'DictVisualizer';

export default React.memo<IDictVisualizerProps>(DictVisualizer);
