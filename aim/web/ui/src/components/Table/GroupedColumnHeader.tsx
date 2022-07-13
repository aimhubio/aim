import React from 'react';

import { Tooltip } from '@material-ui/core';

import { formatValue } from 'utils/formatValue';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

const TITLE_MAX_ROW_LENGTH = 5;
function GroupedColumnHeader({
  data,
}: {
  data: Array<string | number>;
}): React.FunctionComponentElement<React.ReactNode> {
  const Title: React.ReactNode = React.useMemo(() => {
    const filteredData = data.filter((val) => val);
    const isEllipsis: boolean = filteredData.length > TITLE_MAX_ROW_LENGTH;
    return filteredData
      .slice(0, isEllipsis ? TITLE_MAX_ROW_LENGTH : data.length)
      .map((val: any, index) => {
        const value = isSystemMetric(val)
          ? formatSystemMetricName(val)
          : formatValue(val);
        return (
          <div key={val}>
            {value}
            {index + 1 === TITLE_MAX_ROW_LENGTH ? '...' : ''}
          </div>
        );
      });
  }, [data]);

  return (
    <div className='Table__GroupedColumnHeader'>
      <Tooltip title={<div>{Title}</div>}>
        <div>
          <span>Mixed: </span>
          {data.length} values
        </div>
      </Tooltip>
    </div>
  );
}

GroupedColumnHeader.displayName = 'GroupedColumnHeader';

export default React.memo(GroupedColumnHeader);
