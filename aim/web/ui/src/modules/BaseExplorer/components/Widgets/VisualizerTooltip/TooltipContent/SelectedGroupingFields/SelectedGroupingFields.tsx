import React from 'react';
import _ from 'lodash-es';

import { Divider } from '@material-ui/core';

import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary';

import { formatValue } from 'utils/formatValue';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

import { ISelectedGroupingFieldsProps } from '../index';

import './SelectedGroupingFields.scss';

function SelectedGroupingFields(props: ISelectedGroupingFieldsProps) {
  const { fields = {} } = props;

  return _.isEmpty(fields) ? null : (
    <ErrorBoundary>
      <div className='SelectedGroupingFields'>
        <Divider orientation='horizontal' />
        <div className='SelectedGroupingFields__container'>
          <Text tint={50} weight={500}>
            GROUP CONFIG
          </Text>
          {Object.keys(fields).map((groupConfigKey: string) =>
            _.isEmpty(fields[groupConfigKey]) ? null : (
              <React.Fragment key={groupConfigKey}>
                <Text
                  component='p'
                  weight={600}
                  className='SelectedGroupingFields__container__groupKey'
                >
                  {groupConfigKey}
                </Text>
                {Object.keys(fields[groupConfigKey]).map((item) => {
                  let value = fields[groupConfigKey][item];
                  value = isSystemMetric(value)
                    ? formatSystemMetricName(value)
                    : value;
                  return (
                    <div key={item}>
                      <Text size={12} tint={50}>{`${item}: `}</Text>
                      <Text
                        size={12}
                        className='SelectedGroupingFields__container__value'
                      >
                        {formatValue(value)}
                      </Text>
                    </div>
                  );
                })}
              </React.Fragment>
            ),
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
export default React.memo(SelectedGroupingFields);
