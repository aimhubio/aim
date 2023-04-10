import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import FacetGrouping from '../FacetGrouping/FacetGrouping';
import { GroupType } from '../../../../core/pipeline';

import './Grouping.scss';

function Grouping(props: IBaseComponentProps) {
  const {
    engine: { useStore, groupings },
  } = props;
  const currentValues = useStore(groupings.currentValuesSelector);

  const { facetGroupings, restGroupings } = React.useMemo(() => {
    const facet: React.ReactNodeArray = [];
    const rest: React.ReactNodeArray = [];
    Object.keys(currentValues).forEach((key: string) => {
      const Component = groupings[key]?.component;
      if (Component) {
        if (__DEV__) {
          Component.displayName = 'GroupingComponent';
        }
        if (
          [GroupType.GRID, GroupType.ROW, GroupType.COLUMN].indexOf(
            key as GroupType,
          ) !== -1
        ) {
          facet.push(<Component key={key} {...props} />);
        } else {
          rest.push(<Component key={key} {...props} />);
        }
      }
    });
    return { facetGroupings: facet, restGroupings: rest };
  }, [currentValues, groupings, props]);

  return (
    <ErrorBoundary>
      <div className='BaseGrouping'>
        <FacetGrouping items={facetGroupings} />
        <div className='BaseGrouping__content'>{restGroupings}</div>
      </div>
    </ErrorBoundary>
  );
}

Grouping.displayName = 'Grouping';

export default React.memo<IBaseComponentProps>(Grouping);
