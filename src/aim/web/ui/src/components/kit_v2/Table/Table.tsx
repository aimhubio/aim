import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import { CheckedState } from '@radix-ui/react-checkbox';

import Checkbox from '../Checkbox';

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components';
import { TableProps } from './Table.d';
import { TableStyled } from './Table.style';

function Table({
  data,
  className,
  withSelect = true,
  selectedIndices,
  focusedRowIndex,
  ...rest
}: TableProps) {
  const [focusedRow, setFocusedRow] = React.useState<number | undefined>(
    focusedRowIndex,
  );
  const tableRef = React.useRef<HTMLTableElement>(null);
  const columnKeys = React.useMemo(() => Object.keys(data), [data]);
  const [selectedRows, setSelectedRows] = React.useState<number[]>(
    selectedIndices || [],
  );
  const transformedData = React.useMemo(() => {
    const keys = Object.keys(data);
    const length = data[keys[0]].length;
    const result = [];

    for (let i = 0; i < length; i++) {
      const obj: Record<string, any> = {};
      keys.forEach((key: string) => {
        obj[key] = data[key][i];
      });
      result.push(obj);
    }
    return result;
  }, [data]);

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: any) => {
    if (tableRef.current && !tableRef.current.contains(event.target)) {
      setFocusedRow(undefined);
    }
  };

  React.useEffect(() => {
    if (focusedRowIndex !== focusedRow) {
      setFocusedRow(focusedRowIndex);
    }
    if (_.isEqual(selectedIndices, selectedRows) === false) {
      setSelectedRows(selectedIndices!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndices, focusedRowIndex]);

  function onRowClick(e: React.MouseEvent<HTMLTableRowElement>) {
    const { index } = e.currentTarget.dataset;
    if (index) {
      setFocusedRow(Number(index));
    }
  }

  function onRowSelect(checked: CheckedState | undefined, index: number) {
    let selectedList: number[] = [];
    if (checked) {
      selectedList = [...selectedRows, index];
    } else {
      selectedList = selectedRows.filter((i) => i !== index);
    }
    setSelectedRows(selectedList);
  }

  return (
    <TableStyled
      className={classNames('AimTable', className)}
      ref={tableRef}
      {...rest}
    >
      <TableHeader>
        <TableRow>
          {withSelect ? <TableHead>#</TableHead> : null}
          {Object.keys(data).map((header: string, index: number) => (
            <TableHead key={index}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transformedData.map((item: Record<string, any>, index: number) => {
          return (
            <TableRow
              isFocused={
                focusedRow !== undefined ? focusedRow === index : false
              }
              data-index={index}
              onClick={onRowClick}
              key={index}
            >
              {withSelect ? (
                <TableCell>
                  <Checkbox
                    data-index={index}
                    checked={selectedRows.includes(index)}
                    onCheckedChange={(checked) => onRowSelect(checked, index)}
                    onClick={(e: any) => e.stopPropagation()}
                  />
                </TableCell>
              ) : null}
              {columnKeys.map((key: string, columnIndex: number) => {
                return <TableCell key={columnIndex}>{item[key]}</TableCell>;
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </TableStyled>
  );
}

Table.displayName = 'Table';
export default Table;
