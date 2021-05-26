import './SelectForm.less';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import SidebarMenu from './components/SidebarMenu/SidebarMenu';
import SelectInput from './components/SelectInput/SelectInput';
import UI from '../../../../../ui';
import { classNames } from '../../../../../utils';
import { HubMainScreenModel } from '../../models/HubMainScreenModel';
import * as analytics from '../../../../../services/analytics';

function SelectForm(props) {
  let history = useHistory();
  let [focused, setFocused] = useState(false);
  let { runs, searchInput } = HubMainScreenModel.useHubMainScreenState([
    HubMainScreenModel.events.SET_RUNS_STATE,
    HubMainScreenModel.events.SET_SEARCH_INPUT_STATE,
  ]);
  let { setSearchState, setSearchInputState } = HubMainScreenModel.emitters;

  function getFullQuery() {
    let query = searchInput.selectInput.trim().replace(/(^,)|(,$)/g, '');
    if (!!searchInput.selectConditionInput) {
      query = `${query} if ${searchInput.selectConditionInput}`;
    }
    return query;
  }

  function search() {
    const query = getFullQuery();

    setSearchState(
      {
        query,
      },
      () => {
        props.searchByQuery().then(() => {
          let selectedItemsLength = 0;
          const runs = HubMainScreenModel.getState().runs?.data;
          if (!!runs) {
            runs.forEach((r) =>
              r?.metrics?.forEach((m) =>
                m?.traces?.forEach((_) => ++selectedItemsLength),
              ),
            );
          }
          analytics.trackEvent('[Explore] Search runs', {
            selectedItemsLength,
          });
        });
      },
      true,
    );
  }

  return (
    <div
      className={classNames({
        SelectForm: true,
        focused: focused,
      })}
    >
      <div className='SelectForm__body'>
        <div className='SelectForm__form'>
          <div className='SelectForm__form__row'>
            <div className='SelectForm__form__row__title'>Select</div>
            <SelectInput search={search} setFocused={setFocused} />
          </div>
          <div className='SelectForm__form__row'>
            <div className='SelectForm__form__row__title'>If</div>
            <UI.Input
              className='SelectForm__form__row__input'
              classNameWrapper='SelectForm__form__row__input__wrapper'
              placeholder='e.g. `experiment in (nmt_syntok_dynamic, nmt_syntok_greedy) and hparams.lr >= 0.0001`'
              onChange={(evt) =>
                setSearchInputState({
                  selectConditionInput: evt.target.value,
                })
              }
              value={searchInput.selectConditionInput}
              tabIndex={2}
              onKeyPress={(evt) => {
                if (evt.charCode === 13) {
                  search();
                }
              }}
              onFocus={(evt) => setFocused(true)}
              onBlur={(evt) => setFocused(false)}
            />
          </div>
        </div>
        <div className='SelectForm__actions'>
          <div className='SelectForm__action__wrapper'>
            <div
              className={classNames({
                SelectForm__action: true,
                active: runs.isLoading,
                disabled: runs.isLoading,
              })}
              onClick={search}
            >
              <UI.Icon i='search' />
            </div>
          </div>
          <div className='SelectForm__action__wrapper'>
            <SidebarMenu className='SelectForm__action' />
          </div>
          <div className='SelectForm__action__wrapper'>
            <div
              className={classNames({
                SelectForm__action: true,
                disabled: runs.isLoading,
              })}
              onClick={() => {
                history.goBack();
                analytics.trackEvent('[Explore] History go back');
              }}
            >
              <UI.Icon i='arrow_back_ios_new' />
            </div>
          </div>
          <div className='SelectForm__action__wrapper'>
            <div
              className={classNames({
                SelectForm__action: true,
                disabled: runs.isLoading,
              })}
              onClick={() => {
                history.goForward();
                analytics.trackEvent('[Explore] History go forward');
              }}
            >
              <UI.Icon i='arrow_forward_ios' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

SelectForm.propTypes = {};

export default React.memo(SelectForm);
