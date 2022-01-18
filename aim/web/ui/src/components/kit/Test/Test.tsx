import React from 'react';

import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ITestProps } from './types.d';

import './styles.scss';

function Test({
  title,
}: ITestProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div className={'Test'}>
        <Text>{title}</Text>
      </div>
    </ErrorBoundary>
  );
}

Test.displayName = 'Test';

export default React.memo<ITestProps>(Test);
