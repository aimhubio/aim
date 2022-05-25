import React from 'react';

import { Tooltip } from '@material-ui/core';

import { formatValue } from 'utils/formatValue';

const TITLE_MAX_LENGTH = 5;
function GroupHeading({
  data,
}: {
  data: Array<string | number>;
}): React.FunctionComponentElement<React.ReactNode> {
  const title: string = React.useMemo(() => {
    const filteredData = data.filter((val) => val);
    const isEllipsis: boolean = filteredData.length > TITLE_MAX_LENGTH;
    return `${filteredData
      .slice(0, isEllipsis ? TITLE_MAX_LENGTH : data.length)
      .map((val: any) => `${formatValue(val)}`)
      .join(', ')} ${isEllipsis ? '...' : ''}`;
  }, [data]);

  return (
    <div className='Table__GroupHeading'>
      <Tooltip title={<div>{title}</div>}>
        <div>{data.length} distinct values</div>
      </Tooltip>
    </div>
  );
}

GroupHeading.displayName = 'GroupHeading';

export default React.memo(GroupHeading);
