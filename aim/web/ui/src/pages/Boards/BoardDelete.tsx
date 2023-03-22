import * as React from 'react';

import { Button, Icon } from 'components/kit';
import ConfirmModal from 'components/ConfirmModal/ConfirmModal';

function BoardDelete({ board_id, onBoardDelete }: any) {
  let [opened, setOpened] = React.useState(false);

  return (
    <>
      <Button
        className='Boards__list__item__header__delete'
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
        onSubmit={() => onBoardDelete(board_id)}
        text='Are you sure you want to delete this board?'
        icon={<Icon name='delete' />}
        title='Delete board'
        statusType='error'
        confirmBtnText='Delete'
      />
    </>
  );
}

export default BoardDelete;
