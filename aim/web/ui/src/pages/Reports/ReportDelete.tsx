import * as React from 'react';

import { Button, Icon } from 'components/kit';
import ConfirmModal from 'components/ConfirmModal/ConfirmModal';

function ReportDelete({ report_id, onReportDelete }: any) {
  let [opened, setOpened] = React.useState(false);

  return (
    <>
      <Button
        className='Reports__list__item__header__delete'
        color='default'
        size='small'
        variant='outlined'
        withOnlyIcon
        onClick={() => setOpened(true)}
      >
        <Icon name='delete' />
      </Button>
      <ConfirmModal
        open={opened}
        onCancel={() => setOpened(false)}
        onSubmit={() => onReportDelete(report_id)}
        text='Are you sure you want to delete this report?'
        icon={<Icon name='delete' />}
        title='Delete report'
        statusType='error'
        confirmBtnText='Delete'
      />
    </>
  );
}

export default ReportDelete;
