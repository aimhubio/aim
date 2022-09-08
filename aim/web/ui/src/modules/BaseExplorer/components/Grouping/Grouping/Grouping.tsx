import React, { memo } from 'react';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import './Grouping.scss';

function Grouping(props: IBaseComponentProps) {
  const engine = props.engine;
  const currentValues = engine.useStore(engine.groupings.currentValuesSelector);

  const groupingItems = React.useMemo(() => {
    return Object.keys(currentValues).map((key: string) => {
      const Component = engine.groupings[key].component;
      return <Component key={key} {...props} />;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <div className='BaseGrouping'>
        <Text size={12} weight={500} className='BaseGrouping__title'>
          Group by:
        </Text>
        <div className='BaseGrouping__content'>{groupingItems}</div>
      </div>
    </ErrorBoundary>
  );
}

export default memo(Grouping);
