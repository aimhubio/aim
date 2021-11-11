import React from 'react';

import { Text } from 'components/kit';

import { ITestProps } from './types.d';

import './styles.scss';

function Test({
  title,
}: ITestProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className={'Test'}>
      <Text>{title}</Text>
    </div>
  );
}

Test.displayName = 'Test';

export default React.memo<ITestProps>(Test);
