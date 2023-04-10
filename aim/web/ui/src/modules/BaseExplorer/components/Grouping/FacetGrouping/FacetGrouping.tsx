import React from 'react';
import classNames from 'classnames';
import _ from 'lodash-es';

import ControlPopover from 'components/ControlPopover';
import { Button, Icon, Text } from 'components/kit';

import FacetGroupingPopover from './Popover/FacetGroupingPopover';

import './FacetGrouping.scss';

interface IFacetGroupingProps {
  items: React.ReactNodeArray;
}

function FacetGrouping(props: IFacetGroupingProps) {
  const { items } = props;

  return (
    <ControlPopover
      title='Configure facet grouping'
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      anchor={({ onAnchorClick, opened }) => (
        <Button
          size='xSmall'
          onClick={onAnchorClick}
          className={classNames('FacetGrouping', {
            active: opened,
            outlined: !_.isEmpty(items),
          })}
        >
          <Text className='FacetGrouping__label'>facet</Text>
          <Icon
            name='arrow-down-contained'
            className={classNames('FacetGrouping__arrow', { opened })}
            fontSize={6}
          />
        </Button>
      )}
      component={() => <FacetGroupingPopover items={items} />}
    />
  );
}

FacetGrouping.displayName = 'FacetGrouping';

export default React.memo(FacetGrouping);
