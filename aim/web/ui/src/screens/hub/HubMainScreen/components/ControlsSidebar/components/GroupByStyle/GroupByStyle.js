import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import * as analytics from '../../../../../../../services/analytics';
import UI from '../../../../../../../ui';
import { classNames } from '../../../../../../../utils';
import { getGroupingOptions } from '../../helpers';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';

function GroupByStyle(props) {
  let [opened, setOpened] = useState(false);
  let [advanceOpened, setAdvanceOpened] = useState(false);

  const { groupByStyle, seed, persist, against } = props;

  let popupRef = useRef();
  let dropdownRef = useRef();

  let { setContextFilter, setSeed, togglePersistence } =
    HubMainScreenModel.emitters;

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
          groupByStyle.length > 0
            ? `Styled by ${groupByStyle.length} field${
                groupByStyle.length > 1 ? 's' : ''
              }`
            : 'Group by stroke style'
        }
      >
        <div
          className={classNames({
            ControlsSidebar__item: true,
            active: opened || groupByStyle.length > 0,
          })}
          onClick={(evt) => setOpened(!opened)}
        >
          <UI.Icon i='line_style' scale={1.7} />
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
              Select fields for grouping by stroke style
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
              defaultValue={groupByStyle.map((field) => ({
                value: field,
                label: field.startsWith('params.') ? field.substring(7) : field,
              }))}
              ref={dropdownRef}
              onChange={(data) => {
                const selectedItems = !!data ? data : [];
                const values = selectedItems
                  .filter((i) => !!i.value)
                  .map((i) => i.value.trim());
                setContextFilter({
                  groupByStyle: values,
                });
                analytics.trackEvent('[Explore] Group by style');
              }}
              isOpen
              multi
            />
            <div className='ControlsSidebar__item__popup__body__actionContainer'>
              <div className='ControlsSidebar__item__popup__body__action ControlsSidebar__item__popup__body__groupAgainst'>
                <UI.Text overline bold center type='primary'>
                  Select grouping mode
                </UI.Text>
                <div
                  className='ControlsSidebar__item__popup__body__groupAgainst__switch'
                  onClick={() => {
                    setContextFilter({
                      groupByStyle: [],
                      groupAgainst: {
                        ...HubMainScreenModel.getState().contextFilter
                          .groupAgainst,
                        style: !against,
                      },
                    });
                    analytics.trackEvent(
                      `[Explore] ${
                        against ? 'Disable' : 'Enable'
                      } grouping by style reverse mode`,
                    );
                  }}
                >
                  <UI.Text type={!against ? 'primary' : 'grey-dark'} small>
                    <UI.Tooltip tooltip='Group by selected'>Group</UI.Tooltip>
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
                    <UI.Tooltip tooltip='Group by all except selected'>
                      Reverse
                    </UI.Tooltip>
                  </UI.Text>
                </div>
              </div>
            </div>
            <div className='ControlsSidebar__item__popup__body__actionContainer'>
              <UI.Tooltip
                tooltip={
                  advanceOpened
                    ? 'Hide advanced options'
                    : 'Show advanced options'
                }
              >
                <div
                  className={classNames({
                    ControlsSidebar__item__popup__body__actionCollapse: true,
                    collapsed: advanceOpened,
                  })}
                  onClick={() => setAdvanceOpened((opened) => !opened)}
                >
                  <span className='ControlsSidebar__item__popup__body__toggle__action'>
                    <UI.Icon
                      i={advanceOpened ? 'unfold_less' : 'unfold_more'}
                      scale={1}
                    />
                  </span>
                  <UI.Text type='grey-dark' small>
                    Advanced options
                  </UI.Text>
                </div>
              </UI.Tooltip>
              {advanceOpened && (
                <div className='ControlsSidebar__item__popup__body__action'>
                  <UI.Text overline bold type='primary'>
                    Stroke style persistence:
                  </UI.Text>
                  <UI.Text small spacingTop spacing>
                    Enable persistent mode for stroke styles so that each group
                    always has the same stroke style regardless of its order.
                  </UI.Text>
                  <div className='ControlsSidebar__item__popup__body__action__row ControlsSidebar__item__popup__body__action__row--persistence'>
                    <div
                      className='ControlsSidebar__item__popup__body__action__row__persistenceSwitch'
                      onClick={() => {
                        togglePersistence('style');
                        analytics.trackEvent(
                          '[Explore] Toggle style persistence',
                          { persist },
                        );
                      }}
                    >
                      <span
                        className={classNames({
                          ControlsSidebar__item__popup__toggle: true,
                          on: persist,
                        })}
                      >
                        <UI.Icon
                          i={`toggle_${persist ? 'on' : 'off'}`}
                          scale={1.5}
                        />
                      </span>
                      <UI.Text type={persist ? 'primary' : 'grey-dark'} small>
                        {persist ? 'Enabled' : 'Disabled'}
                      </UI.Text>
                    </div>
                    {persist && (
                      <UI.Button
                        size='tiny'
                        disabled={groupByStyle.length === 0}
                        onClick={(evt) => {
                          setSeed(seed + 1, 'style');
                          analytics.trackEvent(
                            '[Explore] Shuffle styles of groups items',
                          );
                        }}
                      >
                        Shuffle
                      </UI.Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

GroupByStyle.propTypes = {
  groupByStyle: PropTypes.arrayOf(PropTypes.string),
  seed: PropTypes.number,
  persist: PropTypes.bool,
};

export default GroupByStyle;
