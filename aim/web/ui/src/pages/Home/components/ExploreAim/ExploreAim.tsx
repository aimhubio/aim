import React from 'react';

import githubIcon from 'assets/icons/github.svg';
import slackIcon from 'assets/icons/slack.svg';

import { Icon, Text } from 'components/kit';

import { trackEvent } from 'services/analytics';

import ExploreAimCard from '../ExploreAimCard/ExploreAimCard';

import './ExploreAim.scss';

export interface IExploreCard {
  title: string;
  description: string;
  path: string;
}
const cardsData: IExploreCard[] = [
  {
    title: 'Runs Explorer',
    description: 'We constantly seek to improve Aim for the community.',
    path: 'runs',
  },
  {
    title: 'Metrics Explorer',
    description:
      "Aim UI uses segment's analytics toolkit to collect basic info about...",
    path: 'metrics',
  },
  {
    title: 'Params Explorer',
    description:
      "Aim UI uses segment's analytics toolkit to collect basic info about...",
    path: 'params',
  },
  {
    title: 'Tags',
    description: 'We constantly seek to improve Aim for the community.',
    path: 'tags',
  },
  {
    title: 'Bookmarks',
    description:
      "Aim UI uses segment's analytics toolkit to collect basic info about...",
    path: 'bookmarks',
  },
];
function ExploreAim(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='ExploreAim'>
      <div>
        <Text component='h2' tint={100} weight={600} size={24}>
          Get Involved
        </Text>
        <div className='ExploreAim__social'>
          <a
            target='_blank'
            href='https://aimstack.slack.com'
            rel='noreferrer'
            className='ExploreAim__social__item'
            onClick={() => trackEvent('[Homepage] go to slack')}
          >
            <img src={slackIcon} alt='slack' />
            <Text component='span' tint={100} size={16} weight={400}>
              Join Aim slack community
            </Text>
            <Icon name='arrow-right' />
          </a>
          <a
            target='_blank'
            href='https://github.com/aimhubio/aim'
            rel='noreferrer'
            className='ExploreAim__social__item'
            onClick={() => trackEvent('[Homepage] go to github')}
          >
            <img src={githubIcon} alt='github' />
            <Text component='span' tint={100} size={16} weight={400}>
              Create an issue <br /> or report a bug to help us improve
            </Text>
            <Icon name='arrow-right' />
          </a>
        </div>
      </div>
      <div className='ExploreAim__block__item'>
        <Text component='h2' tint={100} weight={600} size={24}>
          Explore Aim
        </Text>
        <div className='ExploreAim__card__container'>
          {cardsData.map((item: IExploreCard) => (
            <ExploreAimCard key={item.path} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ExploreAim);
