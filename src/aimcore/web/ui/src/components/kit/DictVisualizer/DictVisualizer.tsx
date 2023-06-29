import * as React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import CopyToClipBoard from 'components/CopyToClipBoard/CopyToClipBoard';

import { formatValue } from 'utils/formatValue';
import { toType, typeToColor } from 'utils/valueToType/valueToType';

import Text from '../Text';
import Icon from '../Icon';
import Button from '../Button';

import {
  IDictVisualizerProps,
  DictVisualizerRowType,
  IDictVisualizerRowProps,
} from './DictVisualizer.d';

import './DictVisualizer.scss';

const ROW_SIZE = 22;

function DictVisualizer(props: IDictVisualizerProps) {
  const [collapsedItems, setCollapsedItems] = React.useState<
    Record<string, boolean>
  >({});

  const initialRows = React.useRef<DictVisualizerRowType[]>([]);

  const [rows, setRows] = React.useState<DictVisualizerRowType[]>([]);

  function collapseToggler(id: string) {
    setCollapsedItems((cI) => ({
      ...cI,
      [id]: !cI[id],
    }));
  }

  React.useEffect(() => {
    initialRows.current = flattenDict(props.src as Record<string, unknown>);
    setRows(initialRows.current);
  }, [props.src]);

  React.useEffect(() => {
    if (
      initialRows.current.length > 0 &&
      Object.keys(collapsedItems).length > 0
    ) {
      let newRows: DictVisualizerRowType[] = [];
      let currentRootIsClosed: string | null = null;
      for (let i = 0; i < initialRows.current.length; i++) {
        const row = initialRows.current[i];
        if (!currentRootIsClosed) {
          newRows.push(row);
        }
        if (collapsedItems[row.id]) {
          currentRootIsClosed =
            currentRootIsClosed === row.id
              ? null
              : currentRootIsClosed !== null
              ? currentRootIsClosed
              : row.id;
        }
      }

      setRows(newRows);
    }
  }, [collapsedItems, initialRows, props.src]);

  return (
    <ErrorBoundary>
      <div
        style={{
          ...props.style,
          height: props.autoScale
            ? Math.min(ROW_SIZE * rows.length, props.style!.height! as number)
            : props.style?.height,
        }}
        className='DictVisualizer'
      >
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width || 0}
              height={height || 0}
              itemCount={rows.length}
              itemSize={ROW_SIZE}
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
    <div
      key={row.key}
      className='DictVisualizer__row'
      style={{
        ...style,
        ...(style?.width === '100%'
          ? { minWidth: '100%', width: 'unset' }
          : {}),
      }}
    >
      {index !== 0 &&
        index !== rowsCount - 1 &&
        Array(row.level + 1)
          .fill('_')
          .map((_, i) => (
            <div key={i} className='DictVisualizer__row__indent' />
          ))}
      {row.root && (
        <Button
          withOnlyIcon
          color='secondary'
          size='xxSmall'
          className='DictVisualizer__row__collapseToggler'
          onClick={() => collapseToggler(row.id)}
        >
          <Icon name={isCollapsed ? 'arrow-right' : 'arrow-down'} />
        </Button>
      )}
      <div className='DictVisualizer__row__content'>
        {row.key !== null && (
          <Text
            size={16}
            tint={100}
            className='DictVisualizer__row__content__key'
          >
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
          className={`DictVisualizer__row__content__value${
            row.closing ? ' DictVisualizer__row__content__value--closing' : ''
          }`}
          style={{
            color: row.color,
            cursor: isCollapsed ? 'pointer' : '',
          }}
          onClick={isCollapsed ? () => collapseToggler(row.id) : undefined}
        >
          {(isCollapsed ? row.closedValue : row.value) as string}
        </Text>
      </div>
      {row.copyContent && (
        <CopyToClipBoard
          className='DictVisualizer__row__copy'
          iconSize='xs'
          copyContent={row.copyContent}
        />
      )}
    </div>
  );
}

// Convert the dict to a list of key-value pairs
function flattenDict(
  dict: Record<string, unknown> | unknown[],
  level: number = 0,
  parentKey: string = 'root',
) {
  let rows: DictVisualizerRowType[] = [];

  // Add top level brackets
  if (level === 0) {
    if (Array.isArray(dict)) {
      let nestedItemsLength = dict.length;
      rows.push({
        id: parentKey,
        root: nestedItemsLength > 0,
        level,
        key: null,
        value: `[${nestedItemsLength === 0 ? ']' : ''}`,
        closedValue: '[...]',
        sub: `${nestedItemsLength} item${nestedItemsLength === 1 ? '' : 's'}`,
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
        value: `{${nestedItemsLength === 0 ? '}' : ''}`,
        closedValue: '{...}',
        sub: `${nestedItemsLength} item${nestedItemsLength === 1 ? '' : 's'}`,
        color: typeToColor('object'),
        copyContent: formatValue(dict),
      });
    }
  }
  for (let key in dict) {
    let item: unknown = Array.isArray(dict) ? dict[+key] : dict[key];
    let type = toType(item);
    let color = typeToColor(type);
    let id = `${parentKey}__${key}`;
    const value = formatValue(item);
    if (Array.isArray(item)) {
      // Add array subtree
      rows.push({
        id,
        root: item.length > 0,
        level,
        key: formatValue(key),
        value: `[${item.length === 0 ? ']' : ''}`,
        closedValue: '[...]',
        sub: `${item.length} item${item.length === 1 ? '' : 's'}`,
        color: typeToColor('array'),
        copyContent: value,
      });
      if (item.length > 0) {
        rows.push(...flattenDict(item as unknown[], level + 1, id));
        rows.push({
          id,
          level,
          closing: true,
          key: null,
          value: ']',
          sub: null,
          color: typeToColor('array'),
        });
      }
    } else if (typeof item === 'object' && item !== null) {
      // Add dict subtree
      let nestedItemsLength = Object.keys(item).length;
      rows.push({
        id,
        root: nestedItemsLength > 0,
        level,
        key: formatValue(key),
        value: `{${nestedItemsLength === 0 ? '}' : ''}`,
        closedValue: '{...}',
        sub: `${nestedItemsLength} item${nestedItemsLength === 1 ? '' : 's'}`,
        color: typeToColor('object'),
        copyContent: value,
      });
      if (nestedItemsLength > 0) {
        rows.push(
          ...flattenDict(item as Record<string, unknown>, level + 1, id),
        );
        rows.push({
          id,
          level,
          closing: true,
          key: null,
          value: '}',
          sub: null,
          color: typeToColor('object'),
        });
      }
    } else {
      // Add row for primitive values
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

  // Add top level closing brackets
  if (level === 0) {
    if (Array.isArray(dict)) {
      rows.push({
        id: parentKey,
        level,
        closing: true,
        key: null,
        value: ']',
        sub: null,
        color: typeToColor('array'),
      });
    } else {
      rows.push({
        id: parentKey,
        level,
        closing: true,
        key: null,
        value: '}',
        sub: null,
        color: typeToColor('object'),
      });
    }
  }

  return rows;
}

DictVisualizer.displayName = 'DictVisualizer';

export default React.memo<IDictVisualizerProps>(DictVisualizer);
