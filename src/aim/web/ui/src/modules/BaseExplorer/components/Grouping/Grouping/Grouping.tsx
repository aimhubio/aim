import React, { memo } from 'react';

import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import './Grouping.scss';

function Grouping(props: IBaseComponentProps) {
  const {
    engine: { useStore, groupings },
  } = props;
  const currentValues = useStore(groupings.currentValuesSelector);

  const groupingItems = React.useMemo(() => {
    return Object.keys(currentValues).map((key: string) => {
      const Component = groupings[key].component;
      if (__DEV__) {
        Component.displayName = 'GroupingComponent';
      }
      return <Component key={key} {...props} />;
    });
  }, [currentValues, groupings, props]);

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

Grouping.displayName = 'Grouping';

export default memo<IBaseComponentProps>(Grouping);
