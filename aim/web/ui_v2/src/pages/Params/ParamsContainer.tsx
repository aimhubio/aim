import React from 'react';

import Params from './Params';

function ParamsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const chartElemRef = React.useRef<HTMLDivElement>(null);

  return <Params chartElemRef={chartElemRef} />;
}

export default ParamsContainer;
