import React from 'react';
import { Button } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';

import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import CodeBlock from 'pages/Home/components/CodeBlock/CodeBlock';
import SelectTag from 'components/SelectTag/SelectTag';
import COLORS from 'config/colors/colors';
import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';

import './BookmarkCard.scss';

const tags = [
  {
    label: 'loss subset=test',
  },
  {
    label: 'loss subset=test',
  },
  {
    label: 'loss subset=test',
  },
  {
    label: 'loss subset=test',
  },
  {
    label: 'loss subset=test',
  },
  {
    label: 'loss subset=test',
  },
  {
    label: 'loss subset=test',
  },
  {
    label: 'loss subset=test',
  },
  {
    label: 'loss subset=test',
  },
];

function BookmarkCard({
  name,
  id,
  app_id,
  description,
  onBookmarkDelete,
}: IBookmarkCardProps): React.FunctionComponentElement<React.ReactNode> {
  const [openModal, setOpenModal] = React.useState<boolean>(false);

  function handleOpenModal() {
    setOpenModal(true);
  }
  function handleCloseModal() {
    setOpenModal(false);
  }

  function handleBookmarkDelete() {
    onBookmarkDelete(id);
  }

  return (
    <div className='BookmarkCard__container'>
      <div className='BookmarkCard__top'>
        <div className='BookmarkCard__title__section'>
          <span className='BookmarkCard__title'>{name}</span>
          <NavLink to={`/metrics/${app_id}`}>
            <Button size='small' color='primary' variant='contained'>
              View Bookmark
            </Button>
          </NavLink>
        </div>
        <p>{description}</p>
      </div>
      <div className='BookmarkCard__bottom'>
        <div className='BookmarkCard__run__expression'>
          <CodeBlock
            rowList={[
              'r = aim.Run(experiment=”my_exp_name”)',
              'r.track(value, name=”loss”, subset=”train”)',
              'r[“hparams”] = “foo”',
            ]}
          />
        </div>
        <div className='BookmarkCard__selected__metrics ScrollBar__hidden'>
          {tags.map((tag, index) => {
            let color = COLORS[0][index % COLORS[0].length];
            return (
              <SelectTag key={tag.label} label={tag.label} color={color} />
            );
          })}
        </div>
      </div>
      <ConfirmModal
        open={openModal}
        onCancel={handleCloseModal}
        onSubmit={handleBookmarkDelete}
        text='Are you sure you want to delete this bookmark?'
      />
      <span className='BookmarkCard__delete' onClick={handleOpenModal}>
        <DeleteOutlinedIcon />
      </span>
    </div>
  );
}

export default BookmarkCard;
