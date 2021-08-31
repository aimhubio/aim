import React, { memo } from 'react';
import * as yup from 'yup';
import { isEmpty, noop } from 'lodash-es';
import { Button, TextField } from '@material-ui/core';
import { useFormik } from 'formik';

import tagsAppModel from 'services/models/tags/tagsAppModel';
import './Tags.scss';

function TagDelete({
  tagInfo,
  tagHash,
  onSoftDeleteModalToggle,
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
          tagsAppModel.archiveTag(tagHash, !tagInfo?.archived).then(() => {
            tagsAppModel.getTagsData().call();
            onSoftDeleteModalToggle();
            isTagDetailOverLayOpened && onTagDetailOverlayToggle();
          });
        }
      }),
    );
  }

  return (
    <div className='TagDelete'>
      <div className='TagDelete__contentContainer'>
        <p className='TagDelete__contentContainer__contentTitle'>Danger Zone</p>
        <div className='TagDelete__contentContainer__contentBox'>
          <>
            <p className='TagDelete__contentContainer__contentBox__warningText'>
              Delete this tag
            </p>
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
          onClick={onSoftDeleteModalToggle}
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
