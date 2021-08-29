import React, { memo, useEffect } from 'react';
import CreateIcon from '@material-ui/icons/Create';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';

import useModel from 'hooks/model/useModel';
import tagDetailAppModel from 'services/models/tags/tagDetailAppModel';
import hexToRgbA from 'utils/haxToRgba';
import TagRunsTable from './TagRunsTable';
import { ITagDetailProps } from 'types/pages/tags/Tags';
import './Tags.scss';

function TagDetail({
  id,
  onSoftDeleteModalToggle,
  onUpdateModalToggle,
}: ITagDetailProps): React.FunctionComponentElement<React.ReactNode> {
  const tagsDetailData = useModel(tagDetailAppModel);
  useEffect(() => {
    tagDetailAppModel.initialize();
  }, []);

  useEffect(() => {
    const tagRequestRef = tagDetailAppModel.getTagById(id);
    const tagRunsRequestRef = tagDetailAppModel.getTagRuns(id);
    tagRunsRequestRef.call();
    tagRequestRef.call();
    return () => {
      tagRunsRequestRef.abort();
      tagRequestRef.abort();
    };
  }, [id]);

  return (
    <div
      className='TagDetail'
      role='button'
      aria-pressed='false'
      onClick={(e) => e.stopPropagation()}
    >
      <div className='TagDetail__headerContainer'>
        {tagsDetailData?.tagInfo && (
          <div className='TagContainer__tagBox'>
            <div
              className='TagContainer__tagBox__tag'
              style={{
                borderColor: tagsDetailData?.tagInfo?.color,
                background: hexToRgbA(tagsDetailData?.tagInfo?.color, 0.1),
              }}
            >
              <span
                className='TagContainer__tagBox__tag__content'
                style={{ color: tagsDetailData?.tagInfo?.color }}
              >
                {tagsDetailData?.tagInfo?.name}
              </span>
            </div>
          </div>
        )}
        <div className='TagDetail__headerContainer__headerActionsBox'>
          <CreateIcon
            color='primary'
            className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
            onClick={onUpdateModalToggle}
          />
          {tagsDetailData?.tagInfo?.archived ? (
            <VisibilityIcon
              color='primary'
              className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
              onClick={onSoftDeleteModalToggle}
            />
          ) : (
            <VisibilityOffIcon
              color='primary'
              className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
              onClick={onSoftDeleteModalToggle}
            />
          )}
          <DeleteOutlineIcon
            fontSize='small'
            color='primary'
            className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
          />
        </div>
      </div>
      {tagsDetailData?.tagRuns && (
        <TagRunsTable runsList={tagsDetailData?.tagRuns} />
      )}
    </div>
  );
}

export default memo(TagDetail);
