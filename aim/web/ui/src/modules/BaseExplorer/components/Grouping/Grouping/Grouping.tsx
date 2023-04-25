import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import FacetGrouping from '../FacetGrouping';

import './Grouping.scss';

function Grouping(props: IBaseComponentProps) {
  const {
    engine: { useStore, groupings },
  } = props;
  const currentValues = useStore(groupings.currentValuesSelector);

  const { facetGroupings, restGroupings } = React.useMemo(() => {
    const facet: Record<string, any> = {};
    const rest: Record<string, any> = {};
    Object.keys(currentValues).forEach((key: string) => {
      const grouping = groupings[key];
      if (grouping.component) {
        if (grouping.settings.facet) {
          facet[key] = grouping;
        } else {
          rest[key] = grouping;
        }
      }
    });
    return { facetGroupings: facet, restGroupings: rest };
  }, [currentValues, groupings]);

  const renderGrouping = React.useCallback(
    ([key, grouping]: [string, any]) => {
      const { component: Component } = grouping;
      if (__DEV__) {
        Component.displayName = 'GroupingComponent';
      }
      return <Component key={key} {...props} />;
    },
    [props],
  );

  return (
    <ErrorBoundary>
      <div className='BaseGrouping'>
        <div className='BaseGrouping__content'>
          <FacetGrouping
            {...props}
            facetGroupings={facetGroupings}
            renderGrouping={renderGrouping}
          />
          {Object.entries(restGroupings).map(renderGrouping)}
        </div>
      </div>
    </ErrorBoundary>
  );
}

Grouping.displayName = 'Grouping';

export default React.memo<IBaseComponentProps>(Grouping);
