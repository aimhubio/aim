import React from 'react';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import ListItem from 'components/kit/ListItem/ListItem';

import { DOCUMENTATIONS } from 'config/references';

import guideStore from './GuidesStore';

import './GuideDocs.scss';

function GuideDocs(): React.FunctionComponentElement<React.ReactNode> {
  const { shuffle, guideLinks, shuffled } = guideStore();

  const onClick: (
    e: React.MouseEvent<HTMLElement>,
    path: string,
    newTab?: boolean,
  ) => void = React.useCallback(
    (e: React.MouseEvent<HTMLElement>, path: string, newTab = false) => {
      e.stopPropagation();
      if (path) {
        window.open(path, newTab ? '_blank' : '_self');
        window.focus();
        return;
      }
    },
    [],
  );

  React.useEffect(() => {
    if (!shuffled) {
      shuffle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='GuideLinks'>
      <Text
        className='GuideLinks__title'
        component='h4'
        tint={100}
        weight={700}
        size={14}
      >
        Guides
      </Text>
      <div className='GuideLinks__content'>
        {guideLinks.map(
          (link: { name: string; url: string }, index: number) => (
            <ListItem size='small' key={index}>
              <Text
                className='GuideLinks__content--name'
                onClick={(e) => onClick(e, link.url)}
                size={12}
                tint={100}
              >
                {link.name}
              </Text>
              <Tooltip title='Explore in new tab'>
                <div>
                  <Icon
                    box
                    fontSize={12}
                    onClick={(e) => onClick(e, link.url, true)}
                    name='new-tab'
                  />
                </div>
              </Tooltip>
            </ListItem>
          ),
        )}
      </div>
      <a
        href={DOCUMENTATIONS.MAIN_PAGE}
        className='GuideLinks--btn'
        target='_blank'
        rel='noreferrer'
      >
        <Button fullWidth variant='outlined' size='xSmall'>
          Docs
        </Button>
      </a>
    </div>
  );
}

export default React.memo(GuideDocs);
