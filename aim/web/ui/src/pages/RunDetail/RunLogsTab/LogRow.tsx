import React from 'react';

function LogRow({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: {
    logsList: Array<{ index: string; value: string }>;
  };
}) {
  return (
    <div style={style}>
      <pre className={'LogRow__line'}>{data.logsList?.[index - 1]?.value}</pre>
    </div>
  );
}

LogRow.displayName = 'RunLogsTab';

export default React.memo(LogRow);
