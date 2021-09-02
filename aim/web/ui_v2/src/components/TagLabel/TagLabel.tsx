import React from 'react';
import hexToRgbA from 'utils/haxToRgba';

import './TagLabel.scss';

function TagLabel({
  color,
  name,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='TagContainer__tagBox'>
      <div
        className='TagContainer__tagBox__tag'
        style={{
          borderColor: color,
          background: hexToRgbA(color, 0.1),
        }}
      >
        <span className='TagContainer__tagBox__tag__content' style={{ color }}>
          {name}
        </span>
      </div>
    </div>
  );
}

export default TagLabel;
