import React from 'react';
import _ from 'lodash-es';
import moment from 'moment';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Modal, Text } from 'components/kit';
import DataList from 'components/kit/DataList';

import { DATE_WITH_SECONDS } from 'config/dates/dates';

import { processDurationTime } from 'utils/processDurationTime';

function ArchiveModal({
  opened,
  onClose,
  selectedRows = {},
  archiveMode,
  onRowSelect,
  archiveRuns,
}: {
  opened: boolean;
  onClose: () => void;
  selectedRows: { [key: string]: any };
  archiveMode: boolean;
  onRowSelect: ({
    actionType,
    data,
  }: {
    actionType: 'single' | 'selectAll' | 'removeAll';
    data?: any;
  }) => {
    [key: string]: any;
  };
  archiveRuns: (
    ids: string[],
    archived: boolean,
  ) => {
    call: () => Promise<any>;
    abort: () => void;
  };
}): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<any>({});
  const disabledTableRef = React.useRef<any>({});
  const archivedText = archiveMode ? 'archive' : 'unarchive';

  const tableColumns = [
    {
      dataKey: 'experiment',
      key: 'experiment',
      title: 'Experiment',
      width: 0,
      flexGrow: 1,
      cellRenderer: function cellRenderer({ cellData, rowIndex }: any) {
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
            <p
              className={classNames('ActionModal__tableRowWithAction__name', {
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
                    (item: any) =>
                      archiveMode ? !item.archived : item.archived,
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
    let archivedList: any[] = [];
    let unarchivedList: any[] = [];
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
            selectedRow?.end_time ? selectedRow?.end_time * 1000 : Date.now(),
          )}`,
          experiment: selectedRow?.experiment?.name ?? 'default',
          name: selectedRow?.name ?? '-',
          runHash: selectedRow.runHash,
          selectKey: selectedRow.selectKey,
          isInProgress: !selectedRow?.end_time,
          creationTime: selectedRow.creation_time * 1000000,
          isDisabled:
            (archiveMode && selectedRow.archived) ||
            (!archiveMode && !selectedRow.archived),
        };
        if (selectedRow.archived) {
          unarchivedList.push(rowData);
        } else {
          archivedList.push(rowData);
        }
      }
    });
    archivedList = _.orderBy(archivedList, ['creationTime'], ['desc']);
    unarchivedList = _.orderBy(unarchivedList, ['creationTime'], ['desc']);
    tableRef.current?.updateData?.({
      newData: archiveMode ? archivedList : unarchivedList,
    });
    disabledTableRef.current?.updateData?.({
      newData: !archiveMode ? archivedList : unarchivedList,
    });
    return {
      data: archiveMode ? archivedList : unarchivedList,
      disabledData: !archiveMode ? archivedList : unarchivedList,
    };
  }, [selectedRows, archiveMode]);

  function onArchive() {
    const ids = data.map((item: any) => item.runHash);
    archiveRuns(ids, archiveMode)
      .call()
      .then(() => onClose());
  }

  return opened ? (
    <Modal
      open={opened}
      onClose={onClose}
      onOk={onArchive}
      cancelButtonText='Cancel'
      okButtonText={archiveMode ? 'Archive' : 'Unarchive'}
      title={`Are you sure you want to ${archivedText} the selected runs?`}
      titleIconName={archivedText}
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
          {archiveMode
            ? 'Archived runs are not visible in search by default. You can always go back and unarchive them.'
            : 'The runs will become visible in search.'}
        </Text>
        <div className='ActionModal__tableTitle'>
          <Text
            size={12}
            weight={600}
            className='ActionModal__tableTitle__count'
          >
            {Object.values(data).length}
          </Text>
          <Text size={12} weight={400}>
            {`runs to ${archivedText}.`}
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
              {`runs are already ${archivedText}d.`}
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

export default React.memo(ArchiveModal);
