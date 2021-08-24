import React, { memo } from 'react';
import * as yup from 'yup';
import { isEmpty, noop } from 'lodash-es';
import { useFormik } from 'formik';
import { NavLink } from 'react-router-dom';
import { Button, Grid, TextField } from '@material-ui/core';

import COLORS from 'config/colors/colors';
import tagsService from 'services/api/tags/tagsService';
import { ITagFormProps } from 'types/components/TagForm/TagForm';

import './TagForm.scss';

function TagForm({
  tagData,
  editMode,
  tagId,
  updateTagName = () => {},
}: ITagFormProps): React.FunctionComponentElement<React.ReactNode> {
  const formik = useFormik({
    initialValues: editMode
      ? { name: tagData?.name || '', color: tagData?.color || '' }
      : { name: '', color: '' },
    onSubmit: noop,
    validationSchema: yup.object({
      name: yup.string().required('Required field'),
      color: yup
        .string()
        .matches(
          /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
          'Is not in correct format',
        ),
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
  const { name, color } = values;

  function onChange(e: React.ChangeEvent<any>) {
    setFieldValue(e?.target?.id, e?.target?.value, true).then(() => {
      setFieldTouched(e?.target?.id, true);
    });
  }

  function onCreateButtonClick() {
    submitForm().then(() =>
      validateForm(values).then((errors) => {
        if (isEmpty(errors)) {
          tagsService.createTag({ name, color }).call();
        }
      }),
    );
  }

  function onSaveButtonClick() {
    submitForm().then(() =>
      validateForm(values).then((errors) => {
        if (isEmpty(errors)) {
          tagsService
            .updateTag({ name, color }, tagId || '')
            .call()
            .then(() => updateTagName && updateTagName(name));
        }
      }),
    );
  }

  function onColorButtonClick(color: string) {
    setFieldValue('color', color);
  }

  function onResetButtonClick() {
    setValues({ name: tagData?.name || '', color: tagData?.color || '' }, true);
  }

  return (
    <Grid container spacing={1} className='TagForm'>
      <form noValidate autoComplete='off'>
        <TextField
          label='Name'
          value={name}
          id='name'
          onChange={onChange}
          error={!!(touched.name && errors.name)}
          helperText={touched.name && errors.name}
        />
        <TextField
          label='Color'
          value={color}
          id='color'
          onChange={onChange}
          error={!!(touched.color && errors.color)}
          helperText={touched.color && errors.color}
        />
        <div className='TagForm__colorBox'>
          {COLORS[0].map((color) => {
            return (
              <Button
                className='TagForm__colorBox__colorButton'
                style={{ background: color }}
                key={color}
                onClick={() => onColorButtonClick(color)}
              >
                {color}
              </Button>
            );
          })}
        </div>
        {editMode ? (
          <>
            <Button onClick={onSaveButtonClick}>Save</Button>
            <Button onClick={onResetButtonClick}>Reset</Button>
          </>
        ) : (
          <>
            <Button onClick={onCreateButtonClick}>Create</Button>
            <NavLink to='/tags'>Cancel</NavLink>
          </>
        )}
      </form>
    </Grid>
  );
}

export default memo(TagForm);
