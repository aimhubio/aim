import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import Table from 'components/Table/Table';
import { Button, Icon, Modal, Text } from 'components/kit';

function DeleteModal({
  opened,
  onClose,
  selectedRows,
  onRowSelect,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const [data, setData] = React.useState<any[]>([]);
  const [disabledData, setDisabledData] = React.useState<any[]>([]);
  const tableRef = React.useRef<any>({});
  const disabledTableRef = React.useRef<any>({});
  const tableColumns = [
    {
      dataKey: 'experiment',
      key: 'experiment',
      title: 'Experiment',
      width: 200,
    },
    {
      dataKey: 'run',
      key: 'run',
      title: 'Run',
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
                  if (_.isEmpty(tmpSelectedRows)) {
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

  React.useEffect(() => {
    const finishedList: any[] = [];
    const inProgressList: any[] = [];
    const runHashList: string[] = [];
    Object.values(selectedRows || {}).forEach((selectedRow: any) => {
      console.log(selectedRow);
      if (!runHashList.includes(selectedRow.runHash)) {
        runHashList.push(selectedRow.runHash);
        const rowData = {
          key: selectedRow.runHash,
          run: `${moment(selectedRow.creation_time * 1000).format(
            'DD MMM YYYY, HH:mm A',
          )}`,
          experiment: selectedRow.experiment.name,
          runHash: selectedRow.runHash,
          selectKey: selectedRow.selectKey,
          isInProgress: !selectedRow?.end_time,
          isDisabled: !selectedRow?.end_time,
        };
        if (selectedRow.archived) {
          inProgressList.push(rowData);
        } else {
          finishedList.push(rowData);
        }
      }
    });

    setData(finishedList);
    setDisabledData(inProgressList);
    tableRef.current?.updateData?.({
      newData: finishedList,
    });
    disabledTableRef.current?.updateData?.({
      newData: inProgressList,
    });
  }, [selectedRows]);

  return (
    opened && (
      <Modal
        opened={opened}
        onClose={onClose}
        onOk={() => {}}
        cancelButtonText='Cancel'
        okButtonText='Delete'
        title='Do you really want to delete?'
        modalType='error'
      >
        <div className='ActionModal'>
          <Text size={14} weight={400} className='ActionModal__infoText'>
            Ones you delete a run, there is no going back. Please be certain.
          </Text>
          <Text size={12} weight={500} className='ActionModal__tableTitle'>
            {`${Object.values(data).length} Selected runs you can delete`}
          </Text>
          {!_.isEmpty(data) && (
            <Table
              ref={tableRef}
              fixed={false}
              columns={tableColumns}
              minHeight={'100px'}
              data={data}
              hideHeaderActions
              headerHeight={28}
              emptyText='No Text'
              rowHeight={24}
              onRowHover={() => {}}
              height='100%'
            />
          )}
          {!_.isEmpty(disabledData) && (
            <Text size={12} weight={500} className='ActionModal__tableTitle'>
              {`${
                Object.values(disabledData).length
              } Selected Runs are In progress. You can’t delete them`}
            </Text>
          )}
          {!_.isEmpty(disabledData) && (
            <div className='ActionModal__disabledTableWrapper'>
              <Table
                ref={disabledTableRef}
                fixed={false}
                columns={tableColumns}
                minHeight={'100px'}
                data={disabledData}
                hideHeaderActions
                headerHeight={28}
                emptyText='No Text'
                rowHeight={24}
                onRowHover={() => {}}
                height='100%'
              />
            </div>
          )}
        </div>
      </Modal>
    )
  );
}

export default React.memo(DeleteModal);
