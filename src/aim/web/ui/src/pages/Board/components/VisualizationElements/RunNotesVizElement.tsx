import * as React from 'react';

import RunDetailNotesTab from 'pages/RunDetail/RunDetailNotesTab';

function RunNotesVizElement(props: any) {
  return (
    <div style={{ flex: 1 }}>
      <RunDetailNotesTab key={props.data} runHash={props.data} />
    </div>
  );
}

export default RunNotesVizElement;
