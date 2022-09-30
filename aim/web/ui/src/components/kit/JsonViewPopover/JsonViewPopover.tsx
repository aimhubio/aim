import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import DictVisualizer from 'components/kit/DictVisualizer';

import { IJsonViewPopoverProps } from './types.d';

import './styles.scss';

/**
 * @property {object} json - json object
 * @return React.FunctionComponentElement<React.ReactNode>
 */

function JsonViewPopover({
  json,
  dictVisualizerSize,
}: IJsonViewPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div className='JsonViewPopover'>
        <DictVisualizer
          src={json}
          style={dictVisualizerSize ?? { width: 300, height: 300 }}
          autoScale
        />
      </div>
    </ErrorBoundary>
  );
}

JsonViewPopover.displayName = 'JsonViewPopover';

export default React.memo<IJsonViewPopoverProps>(JsonViewPopover);
