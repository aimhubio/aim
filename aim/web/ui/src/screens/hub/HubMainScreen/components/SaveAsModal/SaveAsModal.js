import './SaveAsModal.less';

import React, { useState, useRef, useEffect } from 'react';
import * as _ from 'lodash';
import { useToasts } from 'react-toast-notifications';

import { classNames } from '../../../../../utils';
import { HubMainScreenModel } from '../../models/HubMainScreenModel';
import UI from '../../../../../ui';
import * as analytics from '../../../../../services/analytics';

function SaveAsModal(props) {
  let [opened, setOpened] = useState(false);
  let [name, setName] = useState('');
  let [desc, setDesc] = useState('');
  let [processing, setProcessing] = useState(false);

  const { addToast } = useToasts();

  function closeModal() {
    setOpened(false);
    setName('');
    setDesc('');
  }

  function save() {
    return new Promise((resolve, reject) => {
      if (name !== '') {
        setProcessing(true);
        const appOptions = _.omit(
          HubMainScreenModel.getState(),
          props.excludedPropsForAppSave,
        );
        props
          .createApp(appOptions)
          .then((data) => {
            const dashboardOptions = {
              name: name,
              description: desc,
              app_id: data.id,
            };
            props
              .createDashboard(dashboardOptions)
              .then((data) => {
                resolve(data);
                closeModal();
                addToast('Bookmark successfully created', {
                  appearance: 'success',
                });
                analytics.trackEvent('[Explore] create bookmark');
              })
              .catch((err) => {
                addToast('Unable to create a bookmark. Something went wrong.', {
                  appearance: 'error',
                });
              })
              .finally(() => {
                setProcessing(false);
              });
          })
          .catch((err) => {
            addToast('Unable to create a bookmark. Something went wrong.', {
              appearance: 'error',
            });
          })
          .finally(() => {
            setProcessing(false);
          });
      }
    });
  }

  useEffect(() => {
    const createAppSubscription = HubMainScreenModel.subscribe(
      HubMainScreenModel.events.CREATE_APP,
      () => setOpened(true),
    );

    return () => {
      createAppSubscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <div
        className={classNames({
          SaveAsModal__backdrop: true,
          opened,
        })}
        onClick={closeModal}
      />
      <div
        className={classNames({
          SaveAsModal: true,
          opened,
        })}
      >
        {opened && (
          <>
            <div className='SaveAsModal__header'>
              <UI.Text overline bold>
                Add Bookmark
              </UI.Text>
            </div>
            <div className='SaveAsModal__body'>
              <form onSubmit={save}>
                <div className='SaveAsModal__body__formInput'>
                  <UI.Input
                    onChange={(evt) => setName(evt.target.value)}
                    name='name'
                    value={name}
                    placeholder={'Bookmark Name'}
                    autoFocus
                    autoComplete='off'
                  />
                </div>
                <div className='SaveAsModal__body__formInput'>
                  <UI.Input
                    onChange={(evt) => setDesc(evt.target.value)}
                    name='desc'
                    value={desc}
                    placeholder={'Bookmark Description'}
                    autoComplete='off'
                  />
                </div>
              </form>
            </div>
            <div className='SaveAsModal__body__formFooter'>
              <UI.Tooltip tooltip={name === '' ? 'Name can not be empty' : ''}>
                <UI.Button
                  className='SaveAsModal__body__formFooter__button'
                  type='primary'
                  onClick={save}
                  disabled={processing || name === ''}
                >
                  Save
                </UI.Button>
              </UI.Tooltip>
              <UI.Button
                className='SaveAsModal__body__formFooter__button'
                type='secondary'
                onClick={closeModal}
              >
                Cancel
              </UI.Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default SaveAsModal;
