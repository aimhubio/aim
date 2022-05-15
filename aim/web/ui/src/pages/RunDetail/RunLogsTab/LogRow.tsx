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
      <pre className={`LogRow__line line${data.logsList?.[index]?.index}`}>
        {data.logsList?.[index]?.value}
      </pre>
    </div>
  );
}

LogRow.displayName = 'RunLogsTab';

export default React.memo(LogRow);
