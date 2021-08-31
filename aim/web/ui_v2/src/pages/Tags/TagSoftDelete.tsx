import React, { memo, useEffect } from 'react';
import * as yup from 'yup';
import { isEmpty, noop } from 'lodash-es';
import { Button, TextField } from '@material-ui/core';
import { useFormik } from 'formik';

import tagDetailAppModel from 'services/models/tags/tagDetailAppModel';
import tagsAppModel from 'services/models/tags/tagsAppModel';
import { ITagSoftDeleteProps } from 'types/pages/tags/Tags';
import './Tags.scss';

function TagSoftDelete({
  tagInfo,
  tagHash,
  onSoftDeleteModalToggle,
  onTagDetailOverlayToggle,
}: ITagSoftDeleteProps): React.FunctionComponentElement<React.ReactNode> {
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
  useEffect(() => console.log(tagHash), [tagHash]);
  function onChange(e: React.ChangeEvent<any>) {
    setFieldValue('name', e?.target?.value, true).then(() => {
      setFieldTouched('name', true);
    });
  }

  function onTagHide() {
    submitForm().then(() =>
      validateForm(values).then((errors) => {
        if (isEmpty(errors)) {
          tagDetailAppModel.archiveTag(tagHash, !tagInfo?.archived).then(() => {
            tagsAppModel.getTagsData().call();
            onSoftDeleteModalToggle();
            onTagDetailOverlayToggle();
          });
        }
      }),
    );
  }

  function onTagShow() {
    tagDetailAppModel.archiveTag(tagHash, !tagInfo?.archived).then(() => {
      tagsAppModel.getTagsData().call();
      onSoftDeleteModalToggle();
      onTagDetailOverlayToggle();
    });
  }

  return (
    <div className='TagSoftDelete'>
      <div className='TagSoftDelete__contentContainer'>
        {tagInfo?.archived ? (
          <p className='TagSoftDelete__contentContainer__contentBox__warningText'>{`${tagInfo?.name} is hidden`}</p>
        ) : (
          <>
            <p className='TagSoftDelete__contentContainer__contentTitle'>
              Danger Zone
            </p>
            <div className='TagSoftDelete__contentContainer__contentBox'>
              <>
                <p className='TagSoftDelete__contentContainer__contentBox__warningText'>
                  Hide this tag from the main page
                </p>
                <p className='TagSoftDelete__contentContainer__contentBox__warningText'>
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
          </>
        )}
      </div>
      <div className='TagSoftDelete__footerBox'>
        <Button
          onClick={onSoftDeleteModalToggle}
          className='TagSoftDelete__footerBox__cancelButton'
        >
          Cancel
        </Button>
        {tagInfo?.archived ? (
          <Button onClick={onTagShow} variant='contained' color='primary'>
            Bring back
          </Button>
        ) : (
          <Button onClick={onTagHide} variant='contained' color='primary'>
            Hide
          </Button>
        )}
      </div>
    </div>
  );
}

export default memo(TagSoftDelete);
