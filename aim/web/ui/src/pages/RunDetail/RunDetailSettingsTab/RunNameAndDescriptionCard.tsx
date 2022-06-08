import React, { memo } from 'react';
import * as yup from 'yup';
import _ from 'lodash-es';
import { useFormik } from 'formik';

import { Button, TextField } from '@material-ui/core';

import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';

import { IRunNameAndDescriptionCardProps } from './types';

import './RunDetailSettingsTab.scss';

function RunNameAndDescriptionCard({
  runHash,
  defaultName,
  defaultDescription,
  isArchived,
}: IRunNameAndDescriptionCardProps): React.FunctionComponentElement<React.ReactNode> {
  const formik = useFormik({
    initialValues: {
      name: defaultName ?? '',
      description: defaultDescription ?? '',
    },
    onSubmit: _.noop,
    validationSchema: yup.object({
      name: yup.string().required('Name is a required field'),
    }),
  });

  const { values, errors, touched, setFieldValue, setFieldTouched } = formik;

  function onChange(e: React.ChangeEvent<any>, fieldName: string) {
    setFieldValue(fieldName, e?.target?.value, true).then(() => {
      setFieldTouched(fieldName, true);
    });
  }

  React.useEffect(() => {
    analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.tabs.settings.tabView);
  }, []);

  function onSave() {
    runDetailAppModel.editRunNameAndDescription(
      runHash,
      values.name,
      values.description,
      isArchived,
    );
  }

  return (
    <ErrorBoundary>
      <div className='NameAndDescriptionEditCard'>
        <div className='NameAndDescriptionEditCard__header'>
          <Text component='h4' weight={600} size={14} tint={100}>
            Run Properties
          </Text>
          <Button
            onClick={onSave}
            disabled={
              !_.isEmpty(errors) ||
              (values.name === defaultName &&
                values.description === defaultDescription)
            }
            variant='contained'
            color='primary'
          >
            Save
          </Button>
        </div>
        <div className='NameAndDescriptionEditCard__content'>
          <div className='NameAndDescriptionEditCard__content__nameBox'>
            <TextField
              variant='outlined'
              className='TextField__OutLined__Medium NameAndDescriptionEditCard__content__nameBox__nameInput'
              value={values.name}
              onChange={(e) => onChange(e, 'name')}
              error={!!(touched.name && errors.name)}
              helperText={touched.name && errors.name}
              label='Name'
            />
          </div>
          <div className='NameAndDescriptionEditCard__content__descriptionBox'>
            <TextField
              variant='outlined'
              multiline
              label='Description'
              type='textarea'
              className='NameAndDescriptionEditCard__content__descriptionBox__descriptionInput'
              value={values.description}
              onChange={(e) => onChange(e, 'description')}
              error={!!(touched.description && errors.description)}
              helperText={touched.description && errors.description}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default memo(RunNameAndDescriptionCard);
