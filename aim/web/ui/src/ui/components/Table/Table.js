import './Table.less';

import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactJson from 'react-json-view';

import { classNames } from '../../../utils';
import UI from '../..';

function Table(props) {
  const columns =
    !!props.excludedFields && props.excludedFields.length
      ? props.columns.filter((c) => props.excludedFields.indexOf(c.key) === -1)
      : props.columns;

  let leftCols =
    props.columnsOrder?.left?.filter(
      (colKey) => columns.findIndex((col) => colKey === col.key) > -1,
    ) ?? columns.filter((col) => col.pin === 'left').map((col) => col.key);

  let midCols =
    props.columnsOrder?.middle?.filter(
      (colKey) => columns.findIndex((col) => colKey === col.key) > -1,
    ) ??
    columns
      .filter((col) => col.pin !== 'left' && col.pin !== 'right')
      .map((col) => col.key);

  let rightCols =
    props.columnsOrder?.right?.filter(
      (colKey) => columns.findIndex((col) => colKey === col.key) > -1,
    ) ?? columns.filter((col) => col.pin === 'right').map((col) => col.key);

  let [expanded, setExpanded] = useState({});

  let prevExpanded = useRef(props.expanded);

  const leftPane = columns
    .filter((col) => leftCols.includes(col.key))
    .sort((a, b) => leftCols.indexOf(a.key) - leftCols.indexOf(b.key));
  const middlePane = columns
    .filter((col) => midCols.includes(col.key))
    .sort((a, b) => midCols.indexOf(a.key) - midCols.indexOf(b.key));
  const rightPane = columns
    .filter((col) => rightCols.includes(col.key))
    .sort((a, b) => rightCols.indexOf(a.key) - rightCols.indexOf(b.key));
  const sortedColumns = [...leftPane, ...middlePane, ...rightPane];

  useEffect(() => {
    if (props.expanded && props.groups) {
      for (let groupKey in props.expanded) {
        if (
          props.expanded[groupKey] &&
          prevExpanded.current[groupKey] !== props.expanded[groupKey]
        ) {
          setExpanded((exp) => ({
            ...exp,
            [groupKey]: true,
          }));
        }
      }
    }
    prevExpanded.current = props.expanded;
  }, [props.expanded]);

  function expand(groupKey) {
    if (groupKey === 'expand_all') {
      let groupsForExpansion = {};
      for (let key in props.data) {
        groupsForExpansion[key] = true;
        prevExpanded.current[key] = true;
      }
      setExpanded({
        ...expanded,
        ...groupsForExpansion,
      });
    } else if (groupKey === 'collapse_all') {
      for (let key in props.data) {
        prevExpanded.current[key] = false;
      }
      setExpanded({});
    } else {
      prevExpanded.current[groupKey] = !expanded[groupKey];
      setExpanded({
        ...expanded,
        [groupKey]: !expanded[groupKey],
      });
    }
  }

  function togglePin(colKey, side) {
    const columnsOrderClone = _.cloneDeep(props.columnsOrder);
    if (side === 'left') {
      if (columnsOrderClone.left.includes(colKey)) {
        columnsOrderClone.left.splice(
          columnsOrderClone.left.indexOf(colKey),
          1,
        );
        columnsOrderClone.middle.unshift(colKey);
      } else {
        if (columnsOrderClone.right.includes(colKey)) {
          columnsOrderClone.right.splice(
            columnsOrderClone.right.indexOf(colKey),
            1,
          );
        } else {
          columnsOrderClone.middle.splice(
            columnsOrderClone.middle.indexOf(colKey),
            1,
          );
        }
        columnsOrderClone.left.push(colKey);
      }
    } else if (side === 'right') {
      if (columnsOrderClone.right.includes(colKey)) {
        columnsOrderClone.right.splice(
          columnsOrderClone.right.indexOf(colKey),
          1,
        );
        columnsOrderClone.middle.unshift(colKey);
      } else {
        if (columnsOrderClone.left.includes(colKey)) {
          columnsOrderClone.left.splice(
            columnsOrderClone.left.indexOf(colKey),
            1,
          );
        } else {
          columnsOrderClone.middle.splice(
            columnsOrderClone.middle.indexOf(colKey),
            1,
          );
        }
        columnsOrderClone.right.push(colKey);
      }
    } else {
      if (columnsOrderClone.left.includes(colKey)) {
        columnsOrderClone.left.splice(
          columnsOrderClone.left.indexOf(colKey),
          1,
        );
      }
      if (columnsOrderClone.right.includes(colKey)) {
        columnsOrderClone.right.splice(
          columnsOrderClone.right.indexOf(colKey),
          1,
        );
      }
      columnsOrderClone.middle.unshift(colKey);
    }
    props.updateColumns(columnsOrderClone);
  }

  function moveColumn(colKey, pane, from, direction) {
    const columnsOrderClone = _.cloneDeep(props.columnsOrder);
    let to;
    switch (direction) {
      case 'left':
        to = from - 1;
        break;
      case 'right':
        to = from + 1;
        break;
      case 'start':
        to = 0;
        break;
      case 'end':
        to = columnsOrderClone[pane].length - 1;
        break;
    }
    columnsOrderClone[pane].splice(from, 1);
    columnsOrderClone[pane].splice(to, 0, colKey);
    props.updateColumns(columnsOrderClone);
  }

  function sortByColumn(colKey, order) {
    props.setSortFields([...props.sortFields, [colKey, order]]);
  }

  return (
    <div
      className={classNames({
        Table__container: true,
        [`Table__container--${props.rowHeightMode}`]: true,
      })}
    >
      <div
        className={classNames({
          Table: true,
          'Table--grouped': props.groups,
        })}
      >
        {(props.groups || leftPane.length > 0) && (
          <div
            className={classNames({
              Table__pane: true,
              'Table__pane--left': true,
              onlyGroupColumn: leftPane.length === 0,
            })}
          >
            {props.groups && (
              <ConfigColumn
                data={props.data}
                expanded={expanded}
                expand={expand}
              />
            )}
            {leftPane.map((col, index) => (
              <Column
                key={col.key}
                topHeader={props.topHeader}
                showTopHeaderContent={
                  props.topHeader &&
                  sortedColumns[index - 1]?.topHeader !== col.topHeader
                }
                showTopHeaderBorder={
                  props.topHeader &&
                  sortedColumns[index + 1]?.topHeader !== col.topHeader
                }
                col={col}
                data={props.data}
                groups={props.groups}
                expanded={expanded}
                expand={expand}
                togglePin={togglePin}
                pinnedTo='left'
                firstColumn={index === 0}
                width={props.columnsWidths[col.key]}
                updateColumnWidth={props.updateColumnsWidths}
                headerMeta={props.headerMeta}
                isAlwaysVisible={props.alwaysVisibleColumns.includes(col.key)}
                hideColumn={() =>
                  props.setExcludedFields([...props.excludedFields, col.key])
                }
                paneFirstColumn={index === 0}
                paneLastColumn={index === leftPane.length - 1}
                moveColumn={(dir) => moveColumn(col.key, 'left', index, dir)}
                sortable={
                  col.sortableKey &&
                  props.sortFields.findIndex(
                    (f) => f[0] === col.sortableKey,
                  ) === -1
                }
                sortByColumn={(order) => sortByColumn(col.sortableKey, order)}
              />
            ))}
          </div>
        )}
        <div className='Table__pane Table__pane--middle'>
          {middlePane.map((col, index) => (
            <Column
              key={col.key}
              topHeader={props.topHeader}
              showTopHeaderContent={
                props.topHeader &&
                sortedColumns[(leftPane ? leftPane.length : 0) + index - 1]
                  ?.topHeader !== col.topHeader
              }
              showTopHeaderBorder={
                props.topHeader &&
                sortedColumns[(leftPane ? leftPane.length : 0) + index + 1]
                  ?.topHeader !== col.topHeader
              }
              col={col}
              data={props.data}
              groups={props.groups}
              expanded={expanded}
              expand={expand}
              togglePin={togglePin}
              pinnedTo={null}
              firstColumn={index === 0 && leftPane.length === 0}
              width={props.columnsWidths[col.key]}
              updateColumnWidth={props.updateColumnsWidths}
              headerMeta={props.headerMeta}
              isAlwaysVisible={props.alwaysVisibleColumns.includes(col.key)}
              hideColumn={() =>
                props.setExcludedFields([...props.excludedFields, col.key])
              }
              paneFirstColumn={index === 0}
              paneLastColumn={index === middlePane.length - 1}
              moveColumn={(dir) => moveColumn(col.key, 'middle', index, dir)}
              sortable={
                col.sortableKey &&
                props.sortFields.findIndex((f) => f[0] === col.sortableKey) ===
                  -1
              }
              sortByColumn={(order) => sortByColumn(col.sortableKey, order)}
            />
          ))}
        </div>
        {rightPane.length > 0 && (
          <div className='Table__pane Table__pane--right'>
            {rightPane.map((col, index) => (
              <Column
                key={col.key}
                topHeader={props.topHeader}
                showTopHeaderContent={
                  props.topHeader &&
                  sortedColumns[
                    (leftPane ? leftPane.length : 0) +
                      middlePane.length +
                      index -
                      1
                  ]?.topHeader !== col.topHeader
                }
                showTopHeaderBorder={
                  props.topHeader &&
                  sortedColumns[
                    (leftPane ? leftPane.length : 0) +
                      middlePane.length +
                      index +
                      1
                  ]?.topHeader !== col.topHeader
                }
                col={col}
                data={props.data}
                groups={props.groups}
                expanded={expanded}
                expand={expand}
                togglePin={togglePin}
                pinnedTo='right'
                firstColumn={
                  index === 0 &&
                  leftPane.length === 0 &&
                  middlePane.length === 0
                }
                width={props.columnsWidths[col.key]}
                updateColumnWidth={props.updateColumnsWidths}
                headerMeta={props.headerMeta}
                isAlwaysVisible={props.alwaysVisibleColumns.includes(col.key)}
                hideColumn={() =>
                  props.setExcludedFields([...props.excludedFields, col.key])
                }
                paneFirstColumn={index === 0}
                paneLastColumn={index === rightPane.length - 1}
                moveColumn={(dir) => moveColumn(col.key, 'right', index, dir)}
                sortable={
                  col.sortableKey &&
                  props.sortFields.findIndex(
                    (f) => f[0] === col.sortableKey,
                  ) === -1
                }
                sortByColumn={(order) => sortByColumn(col.sortableKey, order)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Table.defaultProps = {
  excludedFields: [],
  rowHeightMode: 'medium',
};

Table.propTypes = {
  excludedFields: PropTypes.array,
  rowHeightMode: PropTypes.string,
};

function Column({
  topHeader,
  showTopHeaderContent,
  showTopHeaderBorder,
  col,
  data,
  groups,
  expanded,
  expand,
  togglePin,
  pinnedTo,
  firstColumn,
  width,
  updateColumnWidth,
  headerMeta,
  isAlwaysVisible,
  hideColumn,
  paneFirstColumn,
  paneLastColumn,
  moveColumn,
  sortable,
  sortByColumn,
}) {
  const [maxWidth, setMaxWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);
  const widthClone = useRef(width);
  const startingPoint = useRef(null);
  function resizeStart({ target }) {
    setIsResizing(true);
    if (pinnedTo === 'right') {
      startingPoint.current = target.parentNode.getBoundingClientRect().right;
    } else {
      startingPoint.current = target.parentNode.getBoundingClientRect().left;
    }
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', resizeEnd);
  }
  function resize(evt) {
    let newWidth;
    if (pinnedTo === 'right') {
      newWidth = startingPoint.current - evt.pageX;
    } else {
      newWidth = evt.pageX - startingPoint.current;
    }
    if (newWidth > 85) {
      widthClone.current = newWidth;
      setMaxWidth(newWidth);
    }
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }
  function resizeEnd() {
    setIsResizing(false);
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', resizeEnd);
    document.body.style.userSelect = 'unset';
    document.body.style.cursor = 'unset';
    setTimeout(() => {
      updateColumnWidth(col.key, widthClone.current);
    }, 100);
  }
  function resetWidth() {
    updateColumnWidth(col.key, widthClone.current, true);
    setMaxWidth(undefined);
  }

  function calcPlaceHolderSize(configKeysLength, itemsLength) {
    if (itemsLength > 4 || itemsLength > configKeysLength) {
      return 0;
    } else if (configKeysLength > 3) {
      return 4 - itemsLength;
    } else {
      return configKeysLength + 1 - itemsLength;
    }
  }

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', resizeEnd);
    };
  }, []);
  return (
    <div
      className='Table__column Table__column--data'
      style={{
        minWidth: maxWidth,
        maxWidth,
      }}
    >
      {topHeader && (
        <div
          className='Table__cell Table__cell--header Table__cell--topHeader'
          style={{
            minWidth: col.minWidth,
            borderRight: showTopHeaderBorder ? '' : 'none',
          }}
        >
          {showTopHeaderContent && col.topHeader && (
            <UI.Text>{col.topHeader}</UI.Text>
          )}
        </div>
      )}
      <div
        className='Table__cell Table__cell--header'
        style={{
          minWidth: col.minWidth,
        }}
      >
        {firstColumn ? headerMeta : null}
        {col.content}
        <UI.Popover
          target={<UI.Icon i='more_vert' scale={1} />}
          targetClassName='Table__action'
          tooltip='Column actions'
          content={(opened, setOpened) => (
            <div className='Table__action__popup__body'>
              {!isAlwaysVisible && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    hideColumn();
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='visibility_off' />
                  <UI.Text small>Hide column</UI.Text>
                </div>
              )}
              {(pinnedTo === 'left' || pinnedTo === 'right') && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    togglePin(col.key, null);
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='push_pin' />
                  <UI.Text small>Unpin</UI.Text>
                </div>
              )}
              {pinnedTo !== 'left' && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    togglePin(col.key, 'left');
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='push_pin' rotate={30} />
                  <UI.Text small>Pin to left</UI.Text>
                </div>
              )}
              {pinnedTo !== 'right' && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    togglePin(col.key, 'right');
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='push_pin' rotate={-30} />
                  <UI.Text small>Pin to right</UI.Text>
                </div>
              )}
              {!paneFirstColumn && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    moveColumn('left');
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='chevron_left' />
                  <UI.Text small>Move left</UI.Text>
                </div>
              )}
              {!paneLastColumn && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    moveColumn('right');
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='chevron_right' />
                  <UI.Text small>Move right</UI.Text>
                </div>
              )}
              {pinnedTo === null && !paneFirstColumn && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    moveColumn('start');
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='first_page' />
                  <UI.Text small>Move to start</UI.Text>
                </div>
              )}
              {pinnedTo === null && !paneLastColumn && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    moveColumn('end');
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='last_page' />
                  <UI.Text small>Move to end</UI.Text>
                </div>
              )}
              {sortable && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    sortByColumn('asc');
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='import_export' />
                  <UI.Text small>
                    Sort by <em>ASC</em>
                  </UI.Text>
                </div>
              )}
              {sortable && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    sortByColumn('desc');
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='import_export' />
                  <UI.Text small>
                    Sort by <em>DESC</em>
                  </UI.Text>
                </div>
              )}
              {width !== undefined && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    resetWidth();
                    setOpened(false);
                  }}
                >
                  <UI.Icon i='vertical_align_center' rotate={90} />
                  <UI.Text small>Reset width</UI.Text>
                </div>
              )}
            </div>
          )}
          popupClassName='Table__action__popup'
        />
        <div
          className={classNames({
            Table__column__resizeHandler: true,
            leftResize: pinnedTo === 'right',
            isResizing: isResizing,
          })}
          onMouseDown={resizeStart}
        />
      </div>
      {groups
        ? Object.keys(data).map((groupKey) => (
          <div key={groupKey} className='Table__group'>
            <Cell
              col={col}
              item={
                typeof data[groupKey].data[col.key] === 'object' &&
                  data[groupKey].data[col.key].hasOwnProperty('content')
                  ? {
                    ...data[groupKey].data[col.key],
                    props: {
                      ...data[groupKey].data[col.key]?.props,
                      onClick: (e) => expand(groupKey),
                    },
                  }
                  : {
                    content: data[groupKey].data[col.key],
                    props: {
                      onClick: (e) => expand(groupKey),
                    },
                  }
              }
              className={classNames({
                Table__group__header__cell: true,
                expanded: expanded[groupKey],
                expandable: true,
              })}
            />
            {expanded[groupKey] && (
                <>
                  {data[groupKey].items.map((item, i) => (
                    <Cell
                      key={col.key + i}
                      col={col}
                      item={item[col.key]}
                      metadata={firstColumn ? item.rowMeta : null}
                    />
                  ))}
                  {calcPlaceHolderSize(
                    Object.keys(data[groupKey].meta).length,
                    data[groupKey].items.length,
                  ) > 0 && (
                    <Cell
                      placeholder
                      groupLength={calcPlaceHolderSize(
                        Object.keys(data[groupKey].meta).length,
                        data[groupKey].items.length,
                      )}
                    />
                  )}
                </>
            )}
          </div>
        ))
        : data.map((item, i) => (
          <Cell
            key={col.key + i}
            col={col}
            item={item[col.key]}
            metadata={firstColumn ? item.rowMeta : null}
          />
        ))}
    </div>
  );
}

function Cell({
  item,
  className,
  isConfigColumn,
  groupLength,
  metadata,
  placeholder,
}) {
  return (
    <div
      className={classNames({
        Table__cell: true,
        [`${typeof item === 'object' && item.className}`]: true,
        [className]: !!className,
        Table__group__config__column__cell: isConfigColumn,
        clickable: typeof item === 'object' && !!item.props?.onClick,
        placeholder: !!placeholder,
      })}
      style={{
        cursor:
          typeof item === 'object' && item.props?.onClick
            ? 'pointer'
            : 'inherit',
        ...(typeof item === 'object' &&
          item.hasOwnProperty('style') &&
          item.style),
        ...((isConfigColumn || placeholder) && {
          height: `calc(${groupLength} * var(--cell-height))`,
        }),
      }}
      {...(typeof item === 'object' && item.props)}
    >
      {metadata && <div className='Table__cell__rowMeta'>{metadata}</div>}
      {isConfigColumn || placeholder ? (
        ''
      ) : (
        <div className='Table__cell__value'>
          {typeof item === 'object' && item.hasOwnProperty('content')
            ? item.content
            : item ?? '-'}
        </div>
      )}
    </div>
  );
}

function ConfigColumn({ data, expand, expanded }) {
  function calcGroupHeightSize(configKeysLength, itemsLength) {
    if (itemsLength > 4 || itemsLength > configKeysLength) {
      return itemsLength;
    } else if (configKeysLength > 3) {
      return 4;
    } else {
      return configKeysLength + 1;
    }
  }
  return (
    <div className='Table__column Table__column--config'>
      <div className='Table__cell Table__cell--header Table__cell--topHeader'>
        <UI.Text>Groups</UI.Text>
      </div>
      <div className='Table__cell Table__cell--header'>
        <UI.Text small>Config</UI.Text>
      </div>
      {Object.keys(data).map((groupKey) => (
        <div key={groupKey} className='Table__group'>
          <div
            className={classNames({
              Table__group__config__cell: true,
              expanded: expanded[groupKey],
            })}
          >
            <GroupConfig
              config={data[groupKey].config}
              expand={expand}
              expanded={expanded}
              groupKeys={Object.keys(data)}
              groupKey={groupKey}
            />
          </div>
          {expanded[groupKey] && (
            <Cell
              isConfigColumn
              groupLength={calcGroupHeightSize(
                Object.keys(data[groupKey].meta).length,
                data[groupKey].items.length,
              )}
              metadata={
                <div className='Table__group__config__meta'>
                  <ReactJson
                    name={null}
                    theme='bright:inverted'
                    src={data[groupKey].meta}
                    enableClipboard={false}
                    indentWidth={2}
                    style={{
                      backgroundColor: 'transparent',
                    }}
                  />
                </div>
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

function GroupConfig({ config, expand, expanded, groupKeys, groupKey }) {
  return (
    <>
      <UI.Tooltip
        tooltip={expanded[groupKey] ? 'Collapse group' : 'Expand group'}
      >
        <div className='Table__action' onClick={(evt) => expand(groupKey)}>
          <UI.Icon
            i={expanded[groupKey] ? 'unfold_less' : 'unfold_more'}
            scale={1}
          />
        </div>
      </UI.Tooltip>
      {config}
      <UI.Popover
        target={<UI.Icon i='more_horiz' scale={1} />}
        targetClassName='Table__action'
        tooltip='More actions'
        content={(opened, setOpened) => (
          <div className='Table__action__popup__body'>
            <div
              className='Table__action__popup__item'
              onClick={(evt) => {
                expand(groupKey);
                setOpened(false);
              }}
            >
              <UI.Icon i={expanded[groupKey] ? 'unfold_less' : 'unfold_more'} />
              <UI.Text small>
                {expanded[groupKey] ? 'Collapse group' : 'Expand group'}
              </UI.Text>
            </div>
            {(expanded[groupKey] ||
              groupKeys.some((key) => !!expanded[key])) && (
              <div
                className='Table__action__popup__item'
                onClick={(evt) => {
                  expand('collapse_all');
                  setOpened(false);
                }}
              >
                <UI.Icon i='compress' />
                <UI.Text small>Collapse all</UI.Text>
              </div>
            )}
            {(!expanded[groupKey] ||
              groupKeys.some((key) => !expanded[key])) && (
              <div
                className='Table__action__popup__item'
                onClick={(evt) => {
                  expand('expand_all');
                  setOpened(false);
                }}
              >
                <UI.Icon i='expand' />
                <UI.Text small>Expand all</UI.Text>
              </div>
            )}
          </div>
        )}
        popupClassName='Table__action__popup'
      />
    </>
  );
}

export default Table;
