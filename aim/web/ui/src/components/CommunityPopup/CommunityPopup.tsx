import * as React from 'react';

import { Tooltip } from '@material-ui/core';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import { trackEvent } from 'services/analytics';

import { Button, Text } from '../kit';

import { ICommunityPopupProps } from './';

import './CommunityPopup.scss';

const COMMUNITY_POPUP_SEEN = 'communityPopupSeen';
const COMMUNITY_URL = 'https://community.aimstack.io/';

function CommunityPopup(props: ICommunityPopupProps) {
  const [open, setOpen] = React.useState(false);
  let timeoutIdRef = React.useRef<number>();

  React.useEffect(() => {
    const popupSeenStorage = localStorage.getItem(COMMUNITY_POPUP_SEEN);

    if (popupSeenStorage === 'true') {
      setOpen(false);
    } else {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = window.setTimeout(() => {
        setOpen(true);
      }, 500);
    }
  }, []);

  const onSkip = React.useCallback(() => {
    localStorage.setItem(COMMUNITY_POPUP_SEEN, 'true');
    setOpen(false);
  }, []);

  const onJoin = React.useCallback(() => {
    localStorage.setItem(COMMUNITY_POPUP_SEEN, 'true');
    window.open(COMMUNITY_URL, '_blank');
    trackEvent(ANALYTICS_EVENT_KEYS.sidebar.discord);
    setOpen(false);
  }, []);

  return (
    <Tooltip
      open={open}
      arrow={true}
      placement='right'
      TransitionProps={{
        timeout: {
          // appear doesn't work correct in MUI
          enter: 400,
          exit: 200,
        },
      }}
      classes={{ popper: 'CommunityPopup', tooltip: 'CommunityPopup__tooltip' }}
      title={
        <React.Fragment>
          <Text
            weight={700}
            tint={100}
            size={16}
            component='p'
            className='CommunityPopup__tooltip__title'
          >
            📣 JOIN THE AIM COMMUNITY!
          </Text>
          <div className='CommunityPopup__tooltip__content'>
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
          <div className='CommunityPopup__tooltip__footer'>
            <Button
              size='xSmall'
              className='CommunityPopup__tooltip__footer__skipBtn'
              onClick={onSkip}
            >
              Skip
            </Button>
            <Button
              variant='contained'
              size='xSmall'
              className='CommunityPopup__tooltip__footer__joinBtn'
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
