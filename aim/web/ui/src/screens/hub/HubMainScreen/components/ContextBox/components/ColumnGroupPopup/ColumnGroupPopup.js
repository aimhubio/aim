import './ColumnGroupPopup.less';

import React from 'react';
import PropTypes from 'prop-types';
import UI from '../../../../../../../ui';
import { classNames } from '../../../../../../../utils';

function ColumnGroupPopup(props) {
  const { contextFilter, setContextFilter, param, triggerer } = props;
  const { groupByColor, groupByStyle, groupByChart } = contextFilter;

  function filterIncludesParam(groupFilter) {
    for (let i = 0; i < groupFilter.length; i++) {
      if (groupFilter[i] === param || param === `params.${groupFilter[i]}`) {
        return true;
      }
    }
    return false;
  }

  function toggleGrouping(filterName, groupFilter) {
    setContextFilter(
      {
        [filterName]: filterIncludesParam(groupFilter)
          ? groupFilter.filter((key) => key !== param)
          : groupFilter.concat([param]),
      },
      null,
      true,
    );
  }

  return (
    <UI.Popover
      target={
        triggerer ?? (
          <UI.Icon
            i='layers'
            className={classNames({
              Table__header__action__icon: true,
            })}
          />
        )
      }
      targetClassName={(opened) =>
        classNames({
          Table__header__action: !triggerer,
          active:
            opened ||
            filterIncludesParam(groupByColor) ||
            filterIncludesParam(groupByStyle) ||
            filterIncludesParam(groupByChart),
        })
      }
      tooltip='Apply grouping'
      content={
        <>
          <div className='ContextBox__table__group__popup__header'>
            <UI.Text overline bold>
              Apply grouping
            </UI.Text>
          </div>
          <div className='ContextBox__table__group__popup__body'>
            <div className='ContextBox__table__group__popup__body__row'>
              <UI.Text overline small>
                Group by color
              </UI.Text>
              <UI.Button
                size='tiny'
                type='primary'
                ghost={!filterIncludesParam(groupByColor)}
                onClick={(evt) => toggleGrouping('groupByColor', groupByColor)}
              >
                {filterIncludesParam(groupByColor) ? 'Remove' : 'Apply'}
              </UI.Button>
            </div>
            <UI.Line />
            <div className='ContextBox__table__group__popup__body__row'>
              <UI.Text overline small>
                Group by style
              </UI.Text>
              <UI.Button
                size='tiny'
                type='primary'
                ghost={!filterIncludesParam(groupByStyle)}
                onClick={(evt) => toggleGrouping('groupByStyle', groupByStyle)}
              >
                {filterIncludesParam(groupByStyle) ? 'Remove' : 'Apply'}
              </UI.Button>
            </div>
            <UI.Line />
            <div className='ContextBox__table__group__popup__body__row'>
              <UI.Text overline small>
                Divide into charts
              </UI.Text>
              <UI.Button
                size='tiny'
                type='primary'
                ghost={!filterIncludesParam(groupByChart)}
                onClick={(evt) => toggleGrouping('groupByChart', groupByChart)}
              >
                {filterIncludesParam(groupByChart) ? 'Remove' : 'Apply'}
              </UI.Button>
            </div>
          </div>
        </>
      }
      popupClassName='ContextBox__table__group__popup'
    />
  );
}

ColumnGroupPopup.propTypes = {};

export default ColumnGroupPopup;
