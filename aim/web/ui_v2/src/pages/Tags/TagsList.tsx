import React, { ChangeEvent, memo, useState } from 'react';
import { Button, TextField, Dialog, Drawer } from '@material-ui/core';

import useModel from 'hooks/model/useModel';
import tagDetailAppModel from 'services/models/tags/tagDetailAppModel';
import searchImg from 'assets/icons/search.svg';
import plusImg from 'assets/icons/plus.svg';
import TagForm from 'components/TagForm/TagForm';
import TagsTable from './TagsTable';
import TagDetail from './TagDetail';
import TagSoftDelete from './TagSoftDelete';
import { ITagProps, ITagsListProps } from 'types/pages/tags/Tags';
import './Tags.scss';

function TagsList({
  tagsList,
  isHiddenTagsList,
}: ITagsListProps): React.FunctionComponentElement<React.ReactNode> {
  const tagsDetailData = useModel(tagDetailAppModel);
  const [isCreateModalOpened, setIsCreateModalOpened] = useState(false);
  const [isUpdateModalOpened, setIsUpdateModalOpened] = useState(false);
  const [isSoftDeleteModalOpened, setIsSoftDeleteModalOpened] = useState(false);
  const [isTagDetailOverLayOpened, setIsTagDetailOverLayOpened] =
    useState(false);
  const [tagDetailId, setTagDetailId] = useState('');
  const [searchValue, setSearchValue] = useState('');

  function onCreateModalToggle() {
    setIsCreateModalOpened(!isCreateModalOpened);
  }

  function onUpdateModalToggle() {
    setIsUpdateModalOpened(!isUpdateModalOpened);
  }

  function onSoftDeleteModalToggle() {
    setIsSoftDeleteModalOpened(!isSoftDeleteModalOpened);
  }

  function onTagDetailOverlayToggle() {
    setIsTagDetailOverLayOpened(!isTagDetailOverLayOpened);
  }

  function openTagDetailOverLay() {
    setIsTagDetailOverLayOpened(true);
  }

  function closeTagDetailOverLay() {
    setIsTagDetailOverLayOpened(false);
  }

  function onSearchInputChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value);
  }

  function onTableRunClick(e: MouseEvent, id: string) {
    e.stopPropagation();
    if (!isTagDetailOverLayOpened) {
      openTagDetailOverLay();
    }
    setTagDetailId(id);
  }

  return (
    <div
      role='button'
      aria-pressed='false'
      className='Tags__TagList'
      onClick={closeTagDetailOverLay}
    >
      <div className='Tags__TagList__header'>
        <TextField
          placeholder='Search'
          variant='outlined'
          InputProps={{
            startAdornment: <img src={searchImg} alt='visible' />,
          }}
          onChange={onSearchInputChange}
          value={searchValue}
        />
        {!isHiddenTagsList && (
          <Button
            variant='contained'
            size='small'
            className='Tags__TagList__header__createButton'
            color='primary'
            onClick={onCreateModalToggle}
          >
            <img src={plusImg} alt='visible' />
            Create Tag
          </Button>
        )}
      </div>
      <div className='Tags__TagList__tagListBox'>
        <div className='Tags__TagList__tagListBox__titleBox'>
          <span className='Tags__TagList__tagListBox__titleBox__title'>
            5 Tags
          </span>
        </div>
        <TagsTable
          tagsList={tagsList.filter((tag: ITagProps) =>
            tag.name.includes(searchValue),
          )}
          onTableRunClick={onTableRunClick}
          onSoftDeleteModalToggle={onSoftDeleteModalToggle}
        />
      </div>
      <Dialog
        onClose={onCreateModalToggle}
        aria-labelledby='customized-dialog-title'
        open={isCreateModalOpened}
      >
        <div className='Tags__TagList__modalContainer'>
          <div className='Tags__TagList__modalContainer__titleBox'>
            <span className='Tags__TagList__modalContainer__titleBox__title'>
              Create Tag
            </span>
          </div>
          <div className='Tags__TagList__modalContainer__contentBox'>
            <TagForm onCloseModal={onCreateModalToggle} />
          </div>
        </div>
      </Dialog>
      <Dialog
        onClose={onUpdateModalToggle}
        aria-labelledby='customized-dialog-title'
        open={isUpdateModalOpened}
      >
        <div className='Tags__TagList__modalContainer'>
          <div className='Tags__TagList__modalContainer__titleBox'>
            <span className='Tags__TagList__modalContainer__titleBox__title'>
              Update Tag
            </span>
          </div>
          <div className='Tags__TagList__modalContainer__contentBox'>
            <TagForm
              onCloseModal={onUpdateModalToggle}
              tagData={tagsDetailData?.tagInfo}
              tagId={tagsDetailData?.tagInfo?.id}
              editMode
            />
          </div>
        </div>
      </Dialog>
      <Dialog
        onClose={onSoftDeleteModalToggle}
        aria-labelledby='customized-dialog-title'
        open={isSoftDeleteModalOpened}
      >
        <div className='Tags__TagList__modalContainer'>
          <div className='Tags__TagList__modalContainer__titleBox'>
            <span className='Tags__TagList__modalContainer__titleBox__title'>
              Tag Soft Delete
            </span>
          </div>
          <div className='Tags__TagList__modalContainer__contentBox'>
            {tagsDetailData?.tagInfo && (
              <TagSoftDelete
                tagInfo={tagsDetailData?.tagInfo}
                tagHash={tagsDetailData?.tagInfo?.id}
                onSoftDeleteModalToggle={onSoftDeleteModalToggle}
                onTagDetailOverlayToggle={onTagDetailOverlayToggle}
              />
            )}
          </div>
        </div>
      </Dialog>
      <Drawer
        className='Tags__TagList__overLayContainer'
        variant='persistent'
        anchor='right'
        open={isTagDetailOverLayOpened}
        onClose={onTagDetailOverlayToggle}
      >
        {isTagDetailOverLayOpened && (
          <TagDetail
            id={tagDetailId}
            onSoftDeleteModalToggle={onSoftDeleteModalToggle}
            onUpdateModalToggle={onUpdateModalToggle}
          />
        )}
      </Drawer>
    </div>
  );
}

export default memo(TagsList);
