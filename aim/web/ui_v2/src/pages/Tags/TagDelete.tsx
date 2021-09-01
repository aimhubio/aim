import React, { memo } from 'react';
import * as yup from 'yup';
import { isEmpty, noop } from 'lodash-es';
import { Button, TextField } from '@material-ui/core';
import { useFormik } from 'formik';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import tagsAppModel from 'services/models/tags/tagsAppModel';
import './Tags.scss';

function TagDelete({
  tagInfo,
  tagHash,
  onDeleteModalToggle,
  onTagDetailOverlayToggle,
  isTagDetailOverLayOpened,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const formik = useFormik({
    initialValues: { name: '' },
    onSubmit: noop,
    validationSchema: yup.object({
      name: yup.string().test('name', 'Name does not match', function (name) {
        return name === tagInfo.name;
      }),
    }),
  });
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    submitForm,
    validateForm,
  } = formik;
  const { name } = values;

  function onChange(e: React.ChangeEvent<any>) {
    setFieldValue('name', e?.target?.value, true).then(() => {
      setFieldTouched('name', true);
    });
  }

  function onTagHide() {
    submitForm().then(() =>
      validateForm(values).then((errors) => {
        if (isEmpty(errors)) {
          tagsAppModel.deleteTag(tagHash).then(() => {
            tagsAppModel.getTagsData().call();
            onDeleteModalToggle();
            isTagDetailOverLayOpened && onTagDetailOverlayToggle();
          });
        }
      }),
    );
  }

  return (
    <div className='TagSoftDelete'>
      <div className='TagSoftDelete__contentContainer'>
        <div className='TagSoftDelete__contentContainer__iconContainer'>
          <DeleteOutlineIcon
            className='TagSoftDelete__contentContainer__iconContainer__icon'
            fontSize='large'
          />
        </div>
        <div className='TagDelete__contentContainer__contentBox'>
          <div className='TagSoftDelete__contentContainer__textBox'>
            <p className='TagSoftDelete__contentContainer__textBox__titleText'>
              Are you sure you want to delete this tag?
            </p>
          </div>
          <>
            <p className='TagDelete__contentContainer__contentBox__warningText'>
              {`Please type "${tagInfo?.name}" to confirm:`}
            </p>
            <TextField
              label='Name'
              value={name}
              id='name'
              variant='outlined'
              className='TagForm__tagFormContainer__labelField TextField__OutLined__Small'
              size='small'
              onChange={onChange}
              error={!!(touched.name && errors.name)}
              helperText={touched.name && errors.name}
            />
          </>
        </div>
      </div>
      <div className='TagDelete__footerBox'>
        <Button
          onClick={onDeleteModalToggle}
          className='TagDelete__footerBox__cancelButton'
        >
          Cancel
        </Button>
        <Button onClick={onTagHide} variant='contained' color='primary'>
          Delete
        </Button>
      </div>
    </div>
  );
}

export default memo(TagDelete);
