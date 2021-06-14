import './AlignmentWarning.less';

import React from 'react';

import UI from '../../../../../ui';

function AlignmentWarning(props) {
  return (
    <div className='AlignmentWarning'>
      <UI.Tooltip
        tooltip={`${
          props.isSkipped || !props.isSynced
            ? 'There are traces which include skipped steps.'
            : ''
        } 
                          ${
                            !props.isAsc
                              ? 'Traces are sorted in ascending order'
                              : ''
                          }`}
      >
        <UI.Icon i='error_outline' />
      </UI.Tooltip>
    </div>
  );
}

export default AlignmentWarning;
