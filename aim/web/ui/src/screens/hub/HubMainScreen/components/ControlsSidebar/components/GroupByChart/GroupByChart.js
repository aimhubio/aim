import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import * as analytics from '../../../../../../../services/analytics';
import UI from '../../../../../../../ui';
import { classNames } from '../../../../../../../utils';
import { getGroupingOptions } from '../../helpers';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';

function GroupByChart(props) {
  let [opened, setOpened] = useState(false);

  const { groupByChart, against } = props;

  let popupRef = useRef();
  let dropdownRef = useRef();

  let { setContextFilter } = HubMainScreenModel.emitters;

  let {
    getAllParamsPaths,
    getAllContextKeys,
    isExploreMetricsModeEnabled,
    isExploreParamsModeEnabled,
  } = HubMainScreenModel.helpers;

  useEffect(() => {
    if (opened) {
      if (popupRef.current) {
        popupRef.current.focus();
        const { top } = popupRef.current.getBoundingClientRect();
        popupRef.current.style.maxHeight = `${window.innerHeight - top - 10}px`;
      }
      dropdownRef.current?.selectRef?.current?.focus();
    }
  }, [opened]);

  const options = against
    ? getGroupingOptions(getAllParamsPaths(), [], false, false)
    : getGroupingOptions(
      getAllParamsPaths(),
      getAllContextKeys(),
      isExploreMetricsModeEnabled(),
      isExploreParamsModeEnabled(),
    );

  return (
    <div className='ControlsSidebar__item__wrapper'>
      <UI.Tooltip
        tooltip={
          groupByChart.length > 0
            ? `Divided into charts by ${groupByChart.length} field${
                groupByChart.length > 1 ? 's' : ''
              }`
            : 'Divide into charts'
        }
      >
        <div
          className={classNames({
            ControlsSidebar__item: true,
            active: opened || groupByChart.length > 0,
          })}
          onClick={(evt) => setOpened(!opened)}
        >
          <UI.Icon i='dashboard' scale={1.7} />
        </div>
      </UI.Tooltip>
      {opened && (
        <div
          className='ControlsSidebar__item__popup'
          tabIndex={0}
          ref={popupRef}
          onBlur={(evt) => {
            const currentTarget = evt.currentTarget;
            if (opened) {
              window.setTimeout(() => {
                if (!currentTarget.contains(document.activeElement)) {
                  setOpened(false);
                }
              }, 100);
            }
          }}
        >
          <div className='ControlsSidebar__item__popup__header'>
            <UI.Text overline bold>
              Select fields to divide into charts
            </UI.Text>
          </div>
          <div className='ControlsSidebar__item__popup__body'>
            <UI.Dropdown
              key={`${against}`}
              className='ControlsSidebar__groupingDropdown'
              options={options}
              inline={false}
              formatGroupLabel={(data) => (
                <div>
                  <span>{data.label}</span>
                  <span>{data.options.length}</span>
                </div>
              )}
              defaultValue={groupByChart.map((field) => ({
                value: field,
                label: field.startsWith('params.') ? field.substring(7) : field,
              }))}
              ref={dropdownRef}
              onChange={(data) => {
                const selectedItems = !!data ? data : [];
                const values = selectedItems
                  .filter((i) => !!i.value)
                  .map((i) => i.value.trim());
                setContextFilter(
                  {
                    groupByChart: values,
                  },
                  null,
                  true,
                );
                analytics.trackEvent('[Explore] Divide into charts');
              }}
              isOpen
              multi
            />
            <div className='ControlsSidebar__item__popup__body__actionContainer'>
              <div className='ControlsSidebar__item__popup__body__action ControlsSidebar__item__popup__body__groupAgainst'>
                <UI.Text overline bold center type='primary'>
                  Select dividing mode
                </UI.Text>
                <div
                  className='ControlsSidebar__item__popup__body__groupAgainst__switch'
                  onClick={() => {
                    setContextFilter({
                      groupByChart: [],
                      groupAgainst: {
                        ...HubMainScreenModel.getState().contextFilter
                          .groupAgainst,
                        chart: !against,
                      },
                    });
                    analytics.trackEvent(
                      `[Explore] ${
                        against ? 'Disable' : 'Enable'
                      } grouping by chart reverse mode`,
                    );
                  }}
                >
                  <UI.Text type={!against ? 'primary' : 'grey-dark'} small>
                    <UI.Tooltip tooltip='Divide by selected'>Divide</UI.Tooltip>
                  </UI.Text>
                  <span
                    className={classNames({
                      ControlsSidebar__item__popup__toggle: true,
                      on: against,
                    })}
                  >
                    <UI.Icon
                      i={`toggle_${against ? 'on' : 'off'}`}
                      scale={1.5}
                    />
                  </span>
                  <UI.Text type={against ? 'primary' : 'grey-dark'} small>
                    <UI.Tooltip tooltip='Divide by all except selected'>
                      Reverse
                    </UI.Tooltip>
                  </UI.Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

GroupByChart.propTypes = {
  groupByChart: PropTypes.arrayOf(PropTypes.string),
};

export default GroupByChart;
