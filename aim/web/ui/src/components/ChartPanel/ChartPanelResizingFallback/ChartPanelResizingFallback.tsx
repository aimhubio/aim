import React from 'react';

import { Text } from 'components/kit';

import './ChartPanelResizingFallback.scss';

function ChartPanelResizingFallback() {
  return (
    <div className='ChartPanelResizingFallback'>
      <Text size={14} color='info'>
        Release to resize
      </Text>
    </div>
  );
}

export default React.memo(ChartPanelResizingFallback);
