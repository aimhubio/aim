import React from 'react';

import { Text } from 'components/kit';

import './ResizingFallback.scss';

function ResizingFallback() {
  return (
    <div className='ResizingFallback'>
      <Text size={14} color='info'>
        Release to resize
      </Text>
    </div>
  );
}

export default React.memo(ResizingFallback);
