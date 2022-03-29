import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Modal, Text } from 'components/kit';
import DataList from 'components/kit/DataList';

import { DATE_WITH_SECONDS } from 'config/dates/dates';

function DeleteModal({
  opened,
  onClose,
  selectedRows,
  onRowSelect,
  deleteRuns,
}: any): React.FunctionComponentElement<React.ReactNode> {
  let runsDeleteRequest: any = null;
  const [data, setData] = React.useState<any[]>([]);
  const [disabledData, setDisabledData] = React.useState<any[]>([]);
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
      dataKey: 'name',
      key: 'name',
      title: 'Name',
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
      width: 0,
      flexGrow: 1,
      cellRenderer: function cellRenderer({ cellData, rowData }: any) {
        return (
          <div
            className={classNames('ActionModal__tableRowWithAction', {
              isDisabled: rowData.isDisabled,
            })}
          >
            <p
              className={classNames('ActionModal__tableRowWithAction__date', {
                'in-progress': rowData?.isInProgress,
              })}
            >
              {cellData}
            </p>
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
                <Icon name='minus' fontSize={10} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    return () => {
      runsDeleteRequest?.abort();
    };
  }, []);

  React.useEffect(() => {
    let finishedList: any[] = [];
    let inProgressList: any[] = [];
    const runHashList: string[] = [];
    Object.values(selectedRows || {}).forEach((selectedRow: any) => {
      if (!runHashList.includes(selectedRow.runHash)) {
        runHashList.push(selectedRow.runHash);
        const rowData = {
          key: selectedRow.runHash,
          date: `${moment(selectedRow.creation_time * 1000).format(
            DATE_WITH_SECONDS,
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

    finishedList = _.orderBy(finishedList, ['creationTime'], ['asc']);
    inProgressList = _.orderBy(inProgressList, ['creationTime'], ['asc']);

    setData(finishedList);
    setDisabledData(inProgressList);
    tableRef.current?.updateData?.({
      newData: finishedList,
    });
    disabledTableRef.current?.updateData?.({
      newData: inProgressList,
    });
  }, [selectedRows]);

  function onDelete() {
    const ids = data.map((item: any) => item.runHash);
    runsDeleteRequest = deleteRuns(ids);
    runsDeleteRequest.call().then(() => onClose());
  }

  return (
    opened && (
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
      >
        <div className='ActionModal'>
          <Text size={14} weight={400} className='ActionModal__infoText'>
            You will lose all the logs and data related to them. This action
            cannot be undone.
          </Text>
          <Text size={12} weight={500} className='ActionModal__tableTitle'>
            {`${Object.values(data).length} runs to delete.`}
          </Text>
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
            <Text size={12} weight={500} className='ActionModal__tableTitle'>
              {`${
                Object.values(disabledData).length
              } runs are still in progress. Unfinished runs cannot be deleted.`}
            </Text>
          )}
          {!_.isEmpty(disabledData) && (
            <div className='ActionModal__disabledTableWrapper'>
              <DataList
                tableRef={disabledTableRef}
                tableColumns={tableColumns}
                tableData={disabledData}
                withSearchBar={false}
                rowHeight={24}
                tableClassName='ActionModal__Table'
                height='200px'
              />
            </div>
          )}
        </div>
      </Modal>
    )
  );
}

export default React.memo(DeleteModal);
