import React from 'react';

import { Text } from 'components/kit';

import './ResizingFallback.scss';

function ResizingFallback() {
  return (
    <div className='ResizingFallback'>
      <Text size={14} color='info' className='ResizingFallback__text'>
        Release to resize
      </Text>
    </div>
  );
}

export default React.memo(ResizingFallback);
