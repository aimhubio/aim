import React from 'react';
import _ from 'lodash-es';
import moment from 'moment';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Modal, Text } from 'components/kit';
import DataList from 'components/kit/DataList';

import { DATE_WITH_SECONDS } from 'config/dates/dates';

import { processDurationTime } from 'utils/processDurationTime';

function DeleteModal({
  opened,
  onClose,
  selectedRows = {},
  onRowSelect,
  deleteRuns,
}: {
  opened: boolean;
  onClose: () => void;
  selectedRows: { [key: string]: any };
  onRowSelect: ({
    actionType,
    data,
  }: {
    actionType: 'single' | 'selectAll' | 'removeAll';
    data?: any;
  }) => {
    [key: string]: any;
  };
  deleteRuns: (ids: string[]) => {
    call: () => Promise<any>;
    abort: () => void;
  };
}): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<any>({});
  const disabledTableRef = React.useRef<any>({});

  const tableColumns = [
    {
      dataKey: 'experiment',
      key: 'experiment',
      title: 'Experiment',
      width: 0,
      flexGrow: 1,
      cellRenderer: function cellRenderer({ cellData }: any) {
        return (
          <Tooltip title={cellData}>
            <div>
              <Text
                size={12}
                weight={500}
                className='ActionModal__experimentRow'
                component='p'
              >
                {cellData}
              </Text>
            </div>
          </Tooltip>
        );
      },
    },
    {
      dataKey: 'date',
      key: 'date',
      title: 'Date',
      width: 275,
      cellRenderer: function cellRenderer({ cellData }: any) {
        return (
          <Tooltip title={cellData}>
            <div>
              <Text
                size={12}
                weight={500}
                className='ActionModal__experimentRow'
                component='p'
              >
                {cellData}
              </Text>
            </div>
          </Tooltip>
        );
      },
    },
    {
      dataKey: 'name',
      key: 'name',
      title: 'Name',
      width: 0,
      flexGrow: 1,
      cellRenderer: function cellRenderer({ cellData, rowData }: any) {
        return (
          <div
            className={classNames('ActionModal__tableRowWithAction', {
              isDisabled: rowData.isDisabled,
            })}
          >
            <Text
              size={12}
              weight={500}
              className={classNames('ActionModal__tableRowWithAction__name', {
                'in-progress': rowData?.isInProgress,
              })}
              component='p'
            >
              {cellData}
            </Text>
            {!rowData.isDisabled && (
              <Button
                size='small'
                withOnlyIcon
                color='secondary'
                className={'ActionModal__tableRowWithAction__deleteButton'}
                onClick={() => {
                  const tmpSelectedRows = onRowSelect({
                    data: Object.values(selectedRows).filter(
                      (selectRow: any) => selectRow.runHash === rowData.runHash,
                    ),
                    actionType: 'removeAll',
                  });
                  const hasData = Object.values(tmpSelectedRows).find(
                    (item: any) => item.end_time,
                  );
                  if (!hasData) {
                    onClose();
                  }
                }}
              >
                <Icon name='close' fontSize={10} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const { data, disabledData } = React.useMemo(() => {
    let finishedList: any[] = [];
    let inProgressList: any[] = [];
    const runHashList: string[] = [];
    Object.values(selectedRows).forEach((selectedRow: any) => {
      if (!runHashList.includes(selectedRow.runHash)) {
        runHashList.push(selectedRow.runHash);
        const rowData = {
          key: selectedRow.runHash,
          date: `${moment(selectedRow.creation_time * 1000).format(
            DATE_WITH_SECONDS,
          )} • ${processDurationTime(
            selectedRow?.creation_time * 1000,
            Date.now(),
          )}`,
          experiment: selectedRow?.experiment?.name ?? 'default',
          name: selectedRow?.name ?? '-',
          runHash: selectedRow.runHash,
          selectKey: selectedRow.selectKey,
          isInProgress: !selectedRow?.end_time,
          isDisabled: !selectedRow?.end_time,
          creationTime: selectedRow.creation_time * 1000000,
        };
        if (!selectedRow.end_time) {
          inProgressList.push(rowData);
        } else {
          finishedList.push(rowData);
        }
      }
    });

    finishedList = _.orderBy(finishedList, ['creationTime'], ['desc']);
    inProgressList = _.orderBy(inProgressList, ['creationTime'], ['desc']);

    tableRef.current?.updateData?.({
      newData: finishedList,
    });
    disabledTableRef.current?.updateData?.({
      newData: inProgressList,
    });
    return {
      data: finishedList,
      disabledData: inProgressList,
    };
  }, [selectedRows]);

  function onDelete() {
    const ids = data.map((item: any) => item.runHash);
    deleteRuns(ids)
      .call()
      .then(() => onClose());
  }

  return opened ? (
    <Modal
      open={opened}
      onClose={onClose}
      onOk={onDelete}
      cancelButtonText='Cancel'
      okButtonText='Delete'
      title='Are you sure you want to permanently delete the selected runs?'
      modalType='error'
      titleIconName='delete'
      maxWidth='lg'
      className='ActionModal__container'
      classes={{ paper: 'ActionModalWrapper' }}
    >
      <div className='ActionModal'>
        <Text
          size={14}
          weight={400}
          tint={100}
          className='ActionModal__infoText'
        >
          You will lose all the logs and data related to them. This action
          cannot be undone.
        </Text>
        <div className='ActionModal__tableTitle'>
          <Text
            size={12}
            weight={600}
            color='error'
            className='ActionModal__tableTitle__count'
          >
            {Object.values(data).length}
          </Text>
          <Text size={12} weight={400} color='error'>
            runs to delete.
          </Text>
        </div>
        {!_.isEmpty(data) && (
          <DataList
            tableRef={tableRef}
            tableColumns={tableColumns}
            tableData={data}
            withSearchBar={false}
            rowHeight={24}
            height='200px'
          />
        )}
        {!_.isEmpty(disabledData) && (
          <div className='ActionModal__tableTitle'>
            <Text
              size={12}
              weight={600}
              className='ActionModal__tableTitle__count'
            >
              {Object.values(disabledData).length}
            </Text>
            <Text size={12} weight={400}>
              runs are still in progress. Unfinished runs cannot be deleted.
            </Text>
          </div>
        )}
        {!_.isEmpty(disabledData) && (
          <DataList
            tableRef={disabledTableRef}
            tableColumns={tableColumns}
            tableData={disabledData}
            withSearchBar={false}
            rowHeight={24}
            tableClassName='ActionModal__Table ActionModal__disabledTableWrapper'
            height='200px'
          />
        )}
      </div>
    </Modal>
  ) : (
    <></>
  );
}

export default React.memo(DeleteModal);
