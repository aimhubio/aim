import React from 'react';

import { Text } from 'components/kit';

import { IGroupConfigPopoverProps } from 'types/components/GroupConfigPopover/GroupConfigPopover';

import stopPropagation from 'utils/stopPropagation';
import { formatValue } from 'utils/formatValue';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

import './GroupConfigPopover.scss';

/**
 * @property {Array<{name: string, value: string}>} configData -  array of applied grouping config of line
 */

function GroupConfigPopover({
  configData,
}: IGroupConfigPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div onClick={stopPropagation} className='GroupConfigPopover'>
      {configData.map((item: any) => {
        let value = isSystemMetric(item.value)
          ? formatValue(formatSystemMetricName(item.value))
          : formatValue(item.value);

        return (
          <div key={item.name} className='GroupConfigPopover__item'>
            <Text title={item.name} weight={400} tint={70}>
              {item.name}:
            </Text>
            <Text
              className='GroupConfigPopover__item_value'
              weight={500}
              size={12}
            >
              {value}
            </Text>
          </div>
        );
      })}
    </div>
  );
}

GroupConfigPopover.displayName = 'GroupConfigPopover';

export default React.memo(GroupConfigPopover);
