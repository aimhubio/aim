import React, { memo, useMemo } from 'react';
import * as yup from 'yup';
import { isEmpty, noop } from 'lodash-es';
import { useFormik } from 'formik';
import { makeStyles } from '@material-ui/core';
import { Button, TextField } from '@material-ui/core';

import COLORS from 'config/colors/colors';
import tagsAppModel from 'services/models/tags/tagsAppModel';
import { ITagFormProps } from 'types/components/TagForm/TagForm';

import './TagForm.scss';

const useStyles = makeStyles({
  tagColor: {
    border: ({ colorName, color }: { color: string; colorName: string }) =>
      `1px solid ${colorName === color ? color : 'transparent'}`,
    '&:hover, &:focus': {
      border: ({ colorName }: { colorName: string }) =>
        `1px solid ${colorName} !important;`,
      backgroundColor: 'inherit',
    },
  },
});

type TagColorWrapperProp = {
  colorName: string;
  onColorButtonClick: (colorName: string) => void;
  color: string;
};

function TagColorWrapper({
  colorName,
  onColorButtonClick,
  color,
}: TagColorWrapperProp) {
  const { tagColor } = useStyles({ color, colorName });
  return (
    <Button
      className={`TagForm__tagFormContainer__colorContainer__colorBox__colorButton ${tagColor}`}
      onClick={() => onColorButtonClick(colorName)}
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
  );
}

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
      name: yup
        .string()
        .required('Required field')
        .max(50, 'Must be 50 characters or fewer'),
      comment: yup.string().max(100, 'Must be 100 characters or fewer'),
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
      COLORS[0].map((colorName, index) => (
        <TagColorWrapper
          key={colorName}
          color={color}
          colorName={colorName}
          onColorButtonClick={onColorButtonClick}
        />
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color],
  );

  function onCreateButtonClick() {
    submitForm().then(() =>
      validateForm(values).then((errors) => {
        if (isEmpty(errors)) {
          tagsAppModel
            .createTag({ name, color, description: comment })
            .then((res: any) => {
              if (res.id) {
                onCloseModal();
                tagsAppModel.getTagsData().call();
              }
            });
        }
      }),
    );
  }

  function onSaveButtonClick() {
    submitForm().then(() =>
      validateForm(values).then((errors) => {
        if (isEmpty(errors)) {
          tagsAppModel
            .updateTag({ name, color, description: comment }, tagId || '')
            .then(() => {
              tagsAppModel.getTagsData().call();
              tagsAppModel.getTagById(tagId || '').call();
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
    <div className='TagForm'>
      <div className='TagForm__tagFormContainer'>
        <TextField
          label='Label'
          variant='outlined'
          className='TagForm__tagFormContainer__labelField TextField__OutLined__Medium'
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
