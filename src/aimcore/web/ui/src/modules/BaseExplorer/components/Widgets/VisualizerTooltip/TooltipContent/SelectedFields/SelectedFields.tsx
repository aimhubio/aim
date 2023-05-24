import React from 'react';
import _ from 'lodash-es';

import { Divider } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';
import { Text } from 'components/kit';

import { formatValue } from 'utils/formatValue';

import { ISelectedFieldsProps } from '../index';

import './SelectedFields.scss';

function SelectedFields(props: ISelectedFieldsProps) {
  const { fields = {}, isPopoverPinned = false } = props;
  return _.isEmpty(fields) ? null : (
    <ErrorBoundary>
      <div className='SelectedFields'>
        {isPopoverPinned ? null : <Divider orientation='horizontal' />}
        <div className='SelectedFields__container'>
          <Text weight={500} tint={50}>
            SELECTED FIELDS
          </Text>
          {Object.keys(fields).map((paramKey) => (
            <div key={paramKey} className='SelectedFields__container__value'>
              <Text tint={50}>{`${paramKey}: `}</Text>
              <Text>{formatValue(fields[paramKey])}</Text>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(SelectedFields);
