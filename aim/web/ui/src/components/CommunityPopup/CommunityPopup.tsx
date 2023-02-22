import * as React from 'react';

import { Tooltip } from '@material-ui/core';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import { trackEvent } from 'services/analytics';

import { Button, Text } from '../kit';

import { ICommunityPopupProps } from './';

import './CommunityPopup.scss';

function CommunityPopup(props: ICommunityPopupProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const communityPopupSkipped = localStorage.getItem('communityPopupSkipped');

    if (communityPopupSkipped === 'true') {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, []);

  const onSkip = React.useCallback(() => {
    localStorage.setItem('communityPopupSkipped', 'true');
    setOpen(false);
  }, [setOpen]);

  const onJoin = React.useCallback(() => {
    localStorage.setItem('communityPopupSkipped', 'true');
    setOpen(false);
    window.open('https://community.aimstack.io/', '_blank');
    trackEvent(ANALYTICS_EVENT_KEYS.sidebar.discord);
  }, [setOpen]);

  return (
    <Tooltip
      open={open}
      arrow={true}
      placement='right'
      TransitionProps={{
        timeout: {
          appear: 1000,
          enter: 300,
          exit: 200,
        },
      }}
      classes={{ tooltip: 'CommunityPopup' }}
      title={
        <React.Fragment>
          <Text
            weight={700}
            tint={100}
            size={16}
            component='p'
            className='CommunityPopup__title'
          >
            📣 JOIN THE AIM COMMUNITY!
          </Text>
          <div className='CommunityPopup__content'>
            <Text weight={600} tint={80} size={14} component='p'>
              - Get early access to upcoming Aim features
            </Text>
            <Text weight={600} tint={80} size={14} component='p'>
              - Meet other Aim users
            </Text>
            <Text weight={600} tint={80} size={14} component='p'>
              - Discuss all-things MLOps and ML Research
            </Text>
          </div>
          <div className='CommunityPopup__footer'>
            <Button
              size='xSmall'
              className='CommunityPopup__footer__skipBtn'
              onClick={onSkip}
            >
              Skip
            </Button>
            <Button
              variant='contained'
              size='xSmall'
              className='CommunityPopup__footer__joinBtn'
              onClick={onJoin}
            >
              Join
            </Button>
          </div>
        </React.Fragment>
      }
    >
      <div>{props.children}</div>
    </Tooltip>
  );
}

CommunityPopup.displayName = 'CommunityPopup';

export default React.memo(CommunityPopup);
