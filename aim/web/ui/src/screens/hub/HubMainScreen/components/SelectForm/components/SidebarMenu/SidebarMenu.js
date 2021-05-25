import './SidebarMenu.less';

import React, { useState, useRef, useEffect } from 'react';
import UI from '../../../../../../../ui';
import { classNames } from '../../../../../../../utils';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';

function SidebarMenu(props) {
  let { areControlsChanged } = HubMainScreenModel.helpers;
  let { resetControls } = HubMainScreenModel.emitters;

  let [opened, setOpened] = useState(false);

  let popupRef = useRef();

  useEffect(() => {
    if (opened && popupRef.current) {
      popupRef.current.focus();
    }
  }, [opened]);

  return (
    <div className=''>
      <div
        className={classNames({
          [props.className]: true,
          active: opened,
        })}
        onClick={() => setOpened(!opened)}
      >
        <UI.Icon i='menu' />
      </div>
      {opened && (
        <div
          className='ControlsSidebar__item__popup list ControlsSidebar__item__popup-sidebar'
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
              Menu
            </UI.Text>
          </div>
          <div className='ControlsSidebar__item__popup__list'>
            <div
              className={classNames({
                ControlsSidebar__item__popup__list__item: true,
                text_normalized: true,
                disabled: !areControlsChanged(),
              })}
              onClick={resetControls}
            >
              <UI.Text small>Reset Controls to System Defaults</UI.Text>
            </div>
            <a
              href='https://github.com/aimhubio/aim#searching-experiments'
              target='_blank'
              rel='noopener noreferrer'
            >
              <div
                className={classNames({
                  ControlsSidebar__item__popup__list__item: true,
                  text_normalized: true,
                })}
              >
                <UI.Text small>Searching Experiments (docs)</UI.Text>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

SidebarMenu.propTypes = {};

export default SidebarMenu;
