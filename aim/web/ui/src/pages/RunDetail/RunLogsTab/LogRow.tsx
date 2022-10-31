import React from 'react';

import formatAnsiToHtml from 'utils/formatAnsiToHtml';

function LogRow({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: {
    logsList: string[];
  };
}) {
  return (
    <div style={style}>
      <pre
        className='LogRow__line'
        dangerouslySetInnerHTML={{
          __html: formatAnsiToHtml(data.logsList?.[index - 1] ?? ''),
        }}
      />
    </div>
  );
}

LogRow.displayName = 'RunLogsTab';

export default React.memo(LogRow);
