import React, { memo } from 'react';
import * as yup from 'yup';
import { isEmpty, noop } from 'lodash-es';
import { Button, TextField } from '@material-ui/core';
import { useFormik } from 'formik';

import TagForm from 'components/TagForm/TagForm';
import tagDetailAppModel from 'services/models/tags/tagDetailAppModel';
import { ITagSettingsProps } from 'types/pages/tags/Tags';
import './Tags.scss';

function TagSettings({
  tagInfo,
  tagHash,
}: ITagSettingsProps): React.FunctionComponentElement<React.ReactNode> {
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
    resetForm,
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
          tagDetailAppModel.archiveTag(tagHash, !tagInfo?.archived);
        }
      }),
    );
  }

  function onTagShow() {
    tagDetailAppModel.archiveTag(tagHash, !tagInfo?.archived);
    resetForm();
  }

  return (
    <>
      <TagForm
        tagData={{ name: tagInfo?.name, color: tagInfo?.color }}
        editMode
        tagId={tagHash}
      />
      <div>
        <p>Danger Zone</p>
        <div>
          {tagInfo?.archived ? (
            <>
              <p>{`${tagInfo?.name} is hidden`}</p>
              <Button onClick={onTagShow}>Bring back</Button>
            </>
          ) : (
            <>
              <p>Hide this tag from the main page</p>
              <p>{`Please type "${tagInfo?.name}" to confirm:`}</p>
              <TextField
                label='Color'
                value={name}
                id='color'
                onChange={onChange}
                error={!!(touched.name && errors.name)}
                helperText={touched.name && errors.name}
              />
              <Button onClick={onTagHide}>Hide</Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(TagSettings);
