import React from 'react';
import ReactJson from 'react-json-view';

import { IJsonViewPopoverProps } from './types.d';

import './styles.scss';

/**
 * @property {object} json - json object
 * @return React.FunctionComponentElement<React.ReactNode>
 */

function JsonViewPopover({
  json,
}: IJsonViewPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='JsonViewPopover'>
      <ReactJson
        style={{ width: '100%' }}
        name={false}
        theme='bright:inverted'
        src={json}
      />
    </div>
  );
}

JsonViewPopover.displayName = 'JsonViewPopover';

export default React.memo<IJsonViewPopoverProps>(JsonViewPopover);
