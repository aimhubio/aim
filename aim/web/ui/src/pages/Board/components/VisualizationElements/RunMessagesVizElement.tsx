import * as React from 'react';

import RunLogRecords from 'pages/RunDetail/RunLogRecords';

function RunMessagesVizElement(props: any) {
  return (
    <div style={{ flex: 1 }}>
      <RunLogRecords key={props.data} runHash={props.data} inProgress={false} />
    </div>
  );
}

export default RunMessagesVizElement;
