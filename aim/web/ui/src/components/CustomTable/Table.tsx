// @ts-nocheck
/* eslint-disable react/prop-types */

import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames';

import { rowCeilSizeConfig } from 'config/table/tableConfigs';

import Column from './TableColumn';

import './Table.scss';

function Table(props) {
  const columns = props.columns;

  let leftCols = columns
    .filter((col) => col.pin === 'left')
    .map((col) => col.key);

  let midCols = columns
    .filter((col) => col.pin !== 'left' && col.pin !== 'right')
    .map((col) => col.key);

  let rightCols = columns
    .filter((col) => col.pin === 'right')
    .map((col) => col.key);

  let [expanded, setExpanded] = useState({});

  let prevExpanded = useRef(props.expanded ?? {});

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

  const groups = !Array.isArray(props.data);

  useEffect(() => {
    if (props.expanded && groups) {
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
    prevExpanded.current = props.expanded ?? {};
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
      if (typeof props.onGroupExpandToggle === 'function') {
        props.onGroupExpandToggle(Object.keys(props.data));
      }
    } else if (groupKey === 'collapse_all') {
      for (let key in props.data) {
        prevExpanded.current[key] = false;
      }
      setExpanded({});
      if (typeof props.onGroupExpandToggle === 'function') {
        props.onGroupExpandToggle([]);
      }
    } else {
      prevExpanded.current[groupKey] = !expanded[groupKey];
      setExpanded({
        ...expanded,
        [groupKey]: !expanded[groupKey],
      });
      if (typeof props.onGroupExpandToggle === 'function') {
        props.onGroupExpandToggle(groupKey);
      }
    }
  }

  function togglePin(colKey, side) {
    const columnsOrderClone = {
      left: leftCols,
      middle: midCols,
      right: rightCols,
    };
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
    const columnsOrderClone = {
      left: leftCols,
      middle: midCols,
      right: rightCols,
    };
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

  return (
    <div
      className={classNames({
        Table__container: true,
        [`Table__container--${rowCeilSizeConfig[props.rowHeightMode].name}`]:
          true,
      })}
    >
      <div
        className={classNames({
          Table: true,
          'Table--grouped': groups,
        })}
      >
        {(groups || leftPane.length > 0) && (
          <div
            className={classNames({
              Table__pane: true,
              'Table__pane--left': true,
              onlyGroupColumn: leftPane.length === 0,
            })}
          >
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
                expanded={expanded}
                expand={expand}
                togglePin={togglePin}
                pinnedTo='left'
                firstColumn={index === 0}
                width={props.columnsWidths?.[col.key]}
                updateColumnWidth={props.updateColumnsWidths}
                headerMeta={props.headerMeta}
                isAlwaysVisible={props.alwaysVisibleColumns?.includes(col.key)}
                hideColumn={() =>
                  props.setExcludedFields?.([
                    ...(props.excludedFields || []),
                    col.key,
                  ])
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
                sortByColumn={(order) => props.onSort(col.sortableKey, order)}
                onRowHover={props.onRowHover}
                onRowClick={props.onRowClick}
                columnOptions={col.columnOptions}
              />
            ))}
          </div>
        )}
        <div className='Table__pane Table__pane--middle'>
          {middlePane.map((col, index) => (
            <Column
              key={col.key + index}
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
              expanded={expanded}
              expand={expand}
              togglePin={togglePin}
              pinnedTo={null}
              firstColumn={index === 0 && leftPane.length === 0}
              width={props.columnsWidths?.[col.key]}
              updateColumnWidth={props.updateColumnsWidths}
              headerMeta={props.headerMeta}
              isAlwaysVisible={props.alwaysVisibleColumns?.includes(col.key)}
              hideColumn={() =>
                props.setExcludedFields?.([
                  ...(props.excludedFields || []),
                  col.key,
                ])
              }
              paneFirstColumn={index === 0}
              paneLastColumn={index === middlePane.length - 1}
              moveColumn={(dir) => moveColumn(col.key, 'middle', index, dir)}
              sortable={
                col.sortableKey &&
                props.sortFields.findIndex((f) => f[0] === col.sortableKey) ===
                  -1
              }
              sortByColumn={(order) => props.onSort(col.sortableKey, order)}
              onRowHover={props.onRowHover}
              onRowClick={props.onRowClick}
              columnOptions={col.columnOptions}
              listWindow={props.listWindow}
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
                expanded={expanded}
                expand={expand}
                togglePin={togglePin}
                pinnedTo='right'
                firstColumn={
                  index === 0 &&
                  leftPane.length === 0 &&
                  middlePane.length === 0
                }
                width={props.columnsWidths?.[col.key]}
                updateColumnWidth={props.updateColumnsWidths}
                headerMeta={props.headerMeta}
                isAlwaysVisible={props.alwaysVisibleColumns?.includes(col.key)}
                hideColumn={() =>
                  props.setExcludedFields?.([
                    ...(props.excludedFields || []),
                    col.key,
                  ])
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
                sortByColumn={(order) => props.onSort(col.sortableKey, order)}
                onRowHover={props.onRowHover}
                onRowClick={props.onRowClick}
                columnOptions={col.columnOptions}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Table;
