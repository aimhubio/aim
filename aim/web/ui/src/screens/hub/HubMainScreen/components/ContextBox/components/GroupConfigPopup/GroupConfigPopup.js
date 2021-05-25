import './GroupConfigPopup.less';

import React, { Fragment } from 'react';
import UI from '../../../../../../../ui';
import { formatValue } from '../../../../../../../utils';

function GroupConfigPopup(props) {
  const configKeys = Object.keys(props.config);

  return (
    <>
      <UI.Popover
        target={
          <UI.Button
            className='GroupConfigPopup__container-button'
            size='tiny'
            type='secondary'
          >
            {props.rowsCount} items grouped by {configKeys.length} field
            {configKeys.length > 1 ? 's' : ''}
          </UI.Button>
        }
        tooltip={configKeys.join(', ')}
        content={
          <>
            <div className='GroupConfigPopup__header'>
              <UI.Text overline bold>
                Group config
              </UI.Text>
            </div>
            <div className='GroupConfigPopup__body'>
              {configKeys.map((configKey, i) => (
                <Fragment key={configKey}>
                  <div className='GroupConfigPopup__body__row'>
                    <UI.Text type='grey-darker' small>
                      {configKey}:
                    </UI.Text>
                    <UI.Text type='grey-dark' small>
                      {formatValue(props.config[configKey])}
                    </UI.Text>
                  </div>
                </Fragment>
              ))}
            </div>
          </>
        }
        popupClassName='GroupConfigPopup'
      />
    </>
  );
}

export default GroupConfigPopup;
