import React from 'react';

import { IconBrandGithub, IconFileText } from '@tabler/icons-react';

import logoImg from 'assets/logo.svg';
import { ReactComponent as DiscordIcon } from 'assets/icons/discord.svg';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import CommunityPopup from 'components/CommunityPopup';
import { Text, Icon, Box, Tooltip, Separator } from 'components/kit_v2';

import { PathEnum } from 'config/enums/routesEnum';
import { AIM_VERSION } from 'config/config';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { DOCUMENTATIONS, GITHUB_URL } from 'config/references';

import routes, { IRoute } from 'routes/routes';

import { trackEvent } from 'services/analytics';

import { getItem } from 'utils/storage';

import {
  SidebarContainer,
  SidebarLi,
  SidebarLiContainer,
  SidebarLink,
  SidebarUl,
  SidebarBottom,
  SidebarBottomAnchor,
} from './Sidebar.style';

/**
 * @description Sidebar component for the app
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
function SideBar(): React.FunctionComponentElement<React.ReactNode> {
  function getPathFromStorage(route: PathEnum): PathEnum | string {
    const path = getItem(`${route.slice(1)}Url`) ?? '';
    if (path !== '' && path.startsWith(route)) {
      return path;
    }
    return route;
  }

  return (
    <ErrorBoundary>
      <SidebarContainer>
        <SidebarUl>
          <SidebarLink
            exact={true}
            to={routes.DASHBOARD.path}
            isActive={(m, l) => false}
          >
            <SidebarLi>
              <Box width={28} as='img' src={logoImg} alt='logo' />
            </SidebarLi>
          </SidebarLink>
          <SidebarLiContainer className='ScrollBar__hidden'>
            {Object.values(routes).map((route: IRoute, index: number) => {
              const { showInSidebar, path, displayName, icon } = route;
              return (
                showInSidebar && (
                  <SidebarLink
                    key={index}
                    to={() => getPathFromStorage(path)}
                    exact={true}
                    isActive={(m, location) =>
                      location.pathname.split('/')[1] === path.split('/')[1]
                    }
                  >
                    <SidebarLi>
                      <Icon icon={icon} />
                      <Text css={{ mt: '$4' }} size='$2' color='#707275'>
                        {displayName}
                      </Text>
                    </SidebarLi>
                  </SidebarLink>
                )
              );
            })}
          </SidebarLiContainer>
        </SidebarUl>
        <Separator
          css={{ margin: '0 10px', width: 'auto !important' }}
          orientation='horizontal'
        />
        <SidebarBottom>
          <Tooltip content='Aim Github' contentProps={{ side: 'right' }}>
            <SidebarBottomAnchor
              target='_blank'
              href={GITHUB_URL}
              rel='noreferrer'
              onClick={() => trackEvent(ANALYTICS_EVENT_KEYS.sidebar.github)}
            >
              <Icon color='$textPrimary80' icon={<IconBrandGithub />} />
            </SidebarBottomAnchor>
          </Tooltip>
          <CommunityPopup>
            <Tooltip
              content='Community Discord'
              contentProps={{ side: 'right' }}
            >
              <SidebarBottomAnchor
                target='_blank'
                href='https://community.aimstack.io/'
                rel='noreferrer'
                onClick={() => trackEvent(ANALYTICS_EVENT_KEYS.sidebar.discord)}
              >
                <Icon color='$textPrimary80' icon={<DiscordIcon />} />
              </SidebarBottomAnchor>
            </Tooltip>
          </CommunityPopup>
          <Tooltip content='Docs' contentProps={{ side: 'right' }}>
            <SidebarBottomAnchor
              target='_blank'
              href={DOCUMENTATIONS.MAIN_PAGE}
              rel='noreferrer'
              onClick={() => trackEvent(ANALYTICS_EVENT_KEYS.sidebar.docs)}
            >
              <Icon color='$textPrimary80' icon={<IconFileText />} />
            </SidebarBottomAnchor>
          </Tooltip>
          <Text css={{ textAlign: 'center' }} color='secondary'>
            {`v${AIM_VERSION}`}
          </Text>
        </SidebarBottom>
      </SidebarContainer>
    </ErrorBoundary>
  );
}

export default React.memo(SideBar);
