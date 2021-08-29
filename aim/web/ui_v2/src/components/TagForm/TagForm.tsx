import React, { memo, useMemo } from 'react';
import * as yup from 'yup';
import { isEmpty, noop } from 'lodash-es';
import { useFormik } from 'formik';
import { Button, TextField } from '@material-ui/core';

import COLORS from 'config/colors/colors';
import tagsService from 'services/api/tags/tagsService';
import tagsAppModel from 'services/models/tags/tagsAppModel';
import tagDetailAppModel from 'services/models/tags/tagDetailAppModel';
import { ITagFormProps } from 'types/components/TagForm/TagForm';

import './TagForm.scss';

function TagForm({
  tagData,
  editMode,
  tagId,
  onCloseModal,
}: ITagFormProps): React.FunctionComponentElement<React.ReactNode> {
  const formik = useFormik({
    initialValues: editMode
      ? {
          name: tagData?.name || '',
          color: tagData?.color || COLORS[0][0],
          comment: tagData?.description || '',
        }
      : { name: '', color: COLORS[0][0], comment: '' },
    onSubmit: noop,
    validationSchema: yup.object({
      name: yup.string().required('Required field'),
    }),
  });
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setValues,
    setFieldTouched,
    submitForm,
    validateForm,
  } = formik;
  const { name, color, comment } = values;

  function onChange(e: React.ChangeEvent<any>, fieldName: string) {
    setFieldValue(fieldName, e?.target?.value, true).then(() => {
      setFieldTouched(fieldName, true);
    });
  }

  const colors = useMemo(
    () =>
      COLORS[0].map((colorName) => (
        <Button
          className='TagForm__tagFormContainer__colorContainer__colorBox__colorButton'
          key={colorName}
          onClick={() => onColorButtonClick(colorName)}
          style={{
            border: `1px solid ${colorName === color ? color : 'transparent'}`,
          }}
        >
          <>
            <span
              className='TagForm__tagFormContainer__colorContainer__colorBox__colorButton__content'
              style={{ background: colorName }}
            ></span>
            <span
              className='TagForm__tagFormContainer__colorContainer__colorBox__colorButton__circle'
              style={{ background: colorName }}
            ></span>
          </>
        </Button>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color],
  );

  function onCreateButtonClick() {
    submitForm().then(() =>
      validateForm(values).then((errors) => {
        if (isEmpty(errors)) {
          tagsService
            .createTag({ name, color, description: comment })
            .call()
            .then(() => {
              onCloseModal();
              tagsAppModel.getTagsData().call();
            });
        }
      }),
    );
  }

  function onSaveButtonClick() {
    submitForm().then(() =>
      validateForm(values).then((errors) => {
        if (isEmpty(errors)) {
          tagsService
            .updateTag({ name, color, description: comment }, tagId || '')
            .call()
            .then(() => {
              tagsAppModel.getTagsData().call();
              tagDetailAppModel.getTagById(tagId || '').call();
              onCloseModal();
            });
        }
      }),
    );
  }

  function onResetButtonClick() {
    setValues(
      {
        name: tagData?.name || '',
        color: tagData?.color || '',
        comment: tagData?.description || '',
      },
      true,
    );
  }

  function onColorButtonClick(color: string) {
    setFieldValue('color', color);
  }

  return (
    <div
      className='TagForm'
      role='button'
      aria-pressed='false'
      onClick={(e) => e.stopPropagation()}
    >
      <div className='TagForm__tagFormContainer'>
        <TextField
          label='Label'
          variant='outlined'
          className='TagForm__tagFormContainer__labelField TextField__OutLined__Small'
          onChange={(e) => onChange(e, 'name')}
          value={name}
          size='small'
          error={!!(touched.name && errors.name)}
          helperText={touched.name && errors.name}
        />
        <TextField
          label='Comment'
          variant='outlined'
          onChange={(e) => onChange(e, 'comment')}
          className='TagForm__tagFormContainer__commentField TextField__TextArea__OutLined__Small'
          multiline
          value={comment}
          error={!!(touched.comment && errors.comment)}
          helperText={touched.comment && errors.comment}
        />
        <div className='TagForm__tagFormContainer__colorContainer'>
          <p className='TagForm__tagFormContainer__containerTitle'>Colors</p>
          <div className='TagForm__tagFormContainer__colorContainer__colorBox'>
            {colors}
          </div>
        </div>
        <div className='TagForm__tagFormContainer__previewContainer'>
          <p className='TagForm__tagFormContainer__containerTitle'>Preview</p>
          <div className='TagForm__tagFormContainer__previewContainer__tagPreviewBox'>
            <div
              className='TagForm__tagFormContainer__previewContainer__tagPreviewBox__tagPreview'
              style={{ borderColor: color }}
            >
              <span
                className='TagForm__tagFormContainer__previewContainer__tagPreviewBox__tagPreview__content'
                style={{ background: color }}
              >
                {name || 'Tag Preview'}
              </span>
            </div>
            <span
              className='TagForm__tagFormContainer__previewContainer__tagPreviewBox__tagPreview__label'
              style={{ color }}
            >
              {name || 'Tag Preview'}
            </span>
          </div>
        </div>
      </div>
      <div className='TagForm__tagFormFooterContainer'>
        {editMode ? (
          <>
            <Button
              onClick={onResetButtonClick}
              className='TagForm__tagFormFooterContainer__secondaryButton'
            >
              Reset
            </Button>
            <Button
              onClick={onSaveButtonClick}
              variant='contained'
              color='primary'
              className='TagForm__tagFormFooterContainer__primaryButton'
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onCloseModal}
              className='TagForm__tagFormFooterContainer__secondaryButton'
            >
              Cancel
            </Button>
            <Button
              onClick={onCreateButtonClick}
              variant='contained'
              color='primary'
              className='TagForm__tagFormFooterContainer__primaryButton'
            >
              Create
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(TagForm);
