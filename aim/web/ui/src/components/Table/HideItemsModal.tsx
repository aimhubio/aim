import React from 'react';
import _ from 'lodash-es';
import moment from 'moment';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Modal, Text } from 'components/kit';
import DataList from 'components/kit/DataList';

import { DATE_WITH_SECONDS } from 'config/dates/dates';

import { processDurationTime } from 'utils/processDurationTime';

function HideItemsModal({
  opened,
  onClose,
  selectedRows = {},
  hideMode = false,
  onRowSelect,
  onRowsVisibilityChange,
}: {
  opened: boolean;
  onClose: () => void;
  selectedRows: { [key: string]: any };
  hideMode?: boolean;
  onRowSelect: ({
    actionType,
    data,
  }: {
    actionType: 'single' | 'selectAll' | 'removeAll';
    data?: any;
  }) => {
    [key: string]: any;
  };
  onRowsVisibilityChange: (keys: string[]) => void;
}): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<any>({});
  const disabledTableRef = React.useRef<any>({});
  const actionText = hideMode ? 'hide' : 'show';

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
                      (selectRow: any) => selectRow.key === rowData.key,
                    ),
                    actionType: 'removeAll',
                  });
                  const hasData = Object.values(tmpSelectedRows).find(
                    (item: any) => (hideMode ? !item.isHidden : item.isHidden),
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
    let hideList: any[] = [];
    let showList: any[] = [];
    const runHashList: string[] = [];
    Object.values(selectedRows).forEach((selectedRow: any) => {
      runHashList.push(selectedRow.runHash);
      const rowData = {
        ...selectedRow,
        key: selectedRow.key,
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
        isHidden: selectedRow.isHidden,
        isDisabled:
          (hideMode && selectedRow.isHidden) ||
          (!hideMode && !selectedRow.isHidden),
      };
      if (selectedRow.isHidden) {
        showList.push(rowData);
      } else {
        hideList.push(rowData);
      }
    });
    showList = _.orderBy(showList, ['creationTime'], ['desc']);
    hideList = _.orderBy(hideList, ['creationTime'], ['desc']);
    tableRef.current?.updateData?.({
      newData: hideMode ? hideList : showList,
    });
    disabledTableRef.current?.updateData?.({
      newData: !hideMode ? hideList : showList,
    });
    return {
      data: hideMode ? hideList : showList,
      disabledData: !hideMode ? hideList : showList,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRows]);

  function onVisibilityChange() {
    onRowsVisibilityChange(data.map((item) => item.key));
    onRowSelect({ actionType: 'removeAll', data: [...data, ...disabledData] });
    onClose();
  }

  return opened ? (
    <Modal
      open={opened}
      onClose={onClose}
      onOk={onVisibilityChange}
      cancelButtonText='Cancel'
      okButtonText={actionText}
      title={`Are you sure you want to ${actionText} the selected rows?`}
      titleIconName={hideMode ? 'eye-show-outline' : 'eye-outline-hide'}
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
          {/* //TODO change texts */}
          {hideMode
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
            {`runs to ${actionText}.`}
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
              {`runs are already ${hideMode ? 'hidden' : 'shown'}.`}
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

export default React.memo(HideItemsModal);
