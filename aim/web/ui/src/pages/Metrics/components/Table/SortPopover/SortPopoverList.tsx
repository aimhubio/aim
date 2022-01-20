import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import { ToggleButton, Icon, Text, Button } from 'components/kit';

import { ISortPopoverListProps } from 'types/pages/metrics/components/SortPopover/SortPopover';

import { SortActionTypes, SortField } from 'utils/getSortedFields';

import './SortPopover.scss';

function SortPopoverList({
  filteredSortFields,
  sortFields,
  onSort,
  title,
}: ISortPopoverListProps): React.FunctionComponentElement<React.ReactNode> {
  function handleDelete(field: SortField): void {
    onSort({ field, actionType: SortActionTypes.DELETE });
  }

  return (
    <>
      {!_.isEmpty(filteredSortFields) && (
        <Text size={12} tint={50} className={'SortPopover__container__label'}>
          {title}
        </Text>
      )}
      <div className='SortPopover__container__chipContainer'>
        {filteredSortFields.map((field: any, index: number) => (
          <div className='SortPopover__chip' key={field.value}>
            <div className='SortPopover__chip__left'>
              <Button
                className={classNames('SortPopover__chip__delete', {
                  disabled: field.readonly,
                })}
                onClick={() => handleDelete(field)}
                withOnlyIcon
              >
                <Icon name='close' color='#414B6D' />
              </Button>
            </div>
            <ToggleButton
              className='TooltipContentPopover__toggle__button'
              onChange={(value) => {
                onSort &&
                  onSort({
                    sortFields,
                    order: value,
                    index: sortFields.findIndex(
                      (sortField: SortField) => sortField.value === field.value,
                    ),
                    field: field.value,
                    actionType: SortActionTypes.ORDER_CHANGE,
                  });
              }}
              leftLabel={'Asc'}
              rightLabel={'Desc'}
              leftValue={'asc'}
              rightValue={'desc'}
              value={field.order as string}
              title={field.label}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default React.memo<ISortPopoverListProps>(SortPopoverList);
