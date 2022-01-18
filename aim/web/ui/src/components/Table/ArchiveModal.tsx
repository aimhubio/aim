import React from 'react';

import Table from 'components/Table/Table';
import { Modal, Text } from 'components/kit';

function ArchiveModal({
  opened,
  onClose,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const tableColumns = [
    {
      dataKey: 'experiment',
      key: 'experiment',
      title: 'Experiment',
      width: 100,
    },
    {
      dataKey: 'run',
      key: 'run',
      title: 'Run',
      width: 100,
    },
    {
      dataKey: 'text',
      key: 'text',
      title: 'Text',
      width: 0,
      flexGrow: 1,
      // TODO: replace with a wrapper component for all types of texts visualization
      cellRenderer: function cellRenderer({ cellData }: any) {
        return <p>{'sad'}</p>;
      },
    },
  ];
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      onOk={() => {}}
      cancelButtonText='Cancel'
      okButtonText='Archive'
      title='Do you really want to archive?'
      modalType='warning'
    >
      <div className='ArchiveModal'>
        <Text size={14} weight={400}>
          Archived runs will not appear in search both on Dashboard and Explore.
          But you will still be able to unarchive the run at any time.
        </Text>
        {/* {isOpenArchiveSelectedPopup && ( */}
        <Table
          fixed={false}
          columns={tableColumns}
          minHeight={'100px'}
          data={[
            {
              experiment: '2',
              run: '3',
              text: 'asdasd',
              rowProps: { style: { height: '24px' } },
            },
            {
              experiment: '2',
              run: '3',
              text: 'asdasd',
              rowProps: { style: { height: '24px' } },
            },
            {
              experiment: '2',
              run: '3',
              text: 'asdasd',
              rowProps: { style: { height: '24px' } },
            },
            {
              experiment: '2',
              run: '3',
              text: 'asdasd',
              rowProps: { style: { height: '24px' } },
            },
            {
              experiment: '2',
              run: '3',
              text: 'asdasd',
              rowProps: { style: { height: '24px' } },
            },
            {
              experiment: '2',
              run: '3',
              text: 'asdasd',
              rowProps: { style: { height: '24px' } },
            },
            {
              experiment: '2',
              run: '3',
              text: 'asdasd',
              rowProps: { style: { height: '24px' } },
            },
          ]}
          // isLoading={props?.isLoading}
          hideHeaderActions
          headerHeight={52}
          emptyText='No Text'
          height='100%'
        />
        {/* )} */}
      </div>
    </Modal>
  );
}

export default React.memo(ArchiveModal);
