import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash-es';

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
import { TableContainerStyled, TableStyled } from './Table.style';

function Table({
  data,
  className,
  withSelect = true,
  selectedIndices,
  focusedRowIndex,
  onRowSelect,
  onRowFocus,
  ...rest
}: TableProps) {
  const [focusedRow, setFocusedRow] = React.useState<number | undefined>(
    focusedRowIndex,
  );
  const tableRef = React.useRef<HTMLTableElement>(null);
  const columnKeys = React.useMemo(() => Object.keys(data), [data]);
  const [selectedRows, setSelectedRows] = React.useState<number[]>(
    selectedIndices ?? [],
  );
  const transformedData = React.useMemo(() => {
    const keys = Object.keys(data);
    const length = data[keys[0]]?.length ?? 0;
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
    if (focusedRowIndex !== focusedRow) {
      setFocusedRow(focusedRowIndex);
    }
    if (_.isEqual(selectedIndices, selectedRows) === false) {
      setSelectedRows(selectedIndices!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndices, focusedRowIndex]);

  function handleRowFocus(e: React.MouseEvent<HTMLTableRowElement>) {
    const { index } = e.currentTarget.dataset;
    if (Number(index) === focusedRow) {
      setFocusedRow(undefined);

      if (onRowFocus) {
        onRowFocus(undefined);
      }
      return;
    } else {
      setFocusedRow(Number(index));

      if (onRowFocus) {
        onRowFocus(Number(index));
      }
    }
  }

  function handleRowSelect(checked: CheckedState | undefined, index: number) {
    let selectedList: number[] = checked
      ? [...(selectedRows || []), index]
      : selectedRows.filter((i) => i !== index);

    setSelectedRows(selectedList);

    if (onRowSelect) {
      onRowSelect(selectedList);
    }
  }

  let height = undefined;

  if (tableRef.current?.offsetHeight) {
    height = tableRef.current.offsetHeight;

    if (height > 600) {
      height = 600;
    }
  }

  return (
    <TableContainerStyled css={{ minHeight: height }}>
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
                onClick={handleRowFocus}
                key={index}
              >
                {withSelect ? (
                  <TableCell>
                    <Checkbox
                      data-index={index}
                      checked={selectedRows?.includes(index)}
                      onCheckedChange={(checked) =>
                        handleRowSelect(checked, index)
                      }
                      onClick={(e: any) => e.stopPropagation()}
                    />
                  </TableCell>
                ) : null}
                {columnKeys.map((key: string) => {
                  return <TableCell key={key}>{item[key]}</TableCell>;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </TableStyled>
    </TableContainerStyled>
  );
}

Table.displayName = 'Table';
export default Table;
