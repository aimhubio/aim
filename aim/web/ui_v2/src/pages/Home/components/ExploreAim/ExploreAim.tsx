import React from 'react';
import ExploreAimCard from '../ExploreAimCard/ExploreAimCard';
import githubIcon from 'assets/icons/github.svg';
import slackIcon from 'assets/icons/slack.svg';

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
    path: 'bookmarks',
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
    <div className='ExploreAim__container'>
      <div>
        <h2>Get Involved</h2>
        <div className='ExploreAim__social__container'>
          <a
            target='_blank'
            href='https://aimstack.slack.com'
            rel='noreferrer'
            className='ExploreAim__social__item'
          >
            <img src={slackIcon} alt='slack' />
            <span>Join Aim slack community</span>
            <i className='icon-arrowRight' />
          </a>
          <a
            target='_blank'
            href='https://github.com/aimhubio/aim'
            rel='noreferrer'
            className='ExploreAim__social__item'
          >
            <img src={githubIcon} alt='github' />
            <span>
              Create an issue <br /> or report a bug to help us improve
            </span>
            <i className='icon-arrowRight' />
          </a>
        </div>
      </div>
      <div className='ExploreAim__block__item'>
        <h2>Explore Aim</h2>
        <div className='ExploreAim_card__container'>
          {cardsData.map((item: IExploreCard) => (
            <ExploreAimCard key={item.path} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ExploreAim);
