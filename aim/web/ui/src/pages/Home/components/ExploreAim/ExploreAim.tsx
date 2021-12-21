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
  icon: string;
}
const cardsData: IExploreCard[] = [
  {
    title: 'Runs Explorer',
    description:
      'Runs explorer will help you to holistically view all your runs, each metric last tracked values and tracked hyperparameters.',
    path: 'runs',
    icon: 'runs',
  },
  {
    title: 'Metrics Explorer',
    description:
      'Metrics explorer helps you to compare 100s of metrics within a few clicks. It helps to save lots of time compared to other open-source experiment tracking tools.',
    path: 'metrics',
    icon: 'metrics',
  },
  {
    title: 'Images Explorer',
    description:
      'Track intermediate images and search, compare them on the Images Explorer.',
    path: 'images',
    icon: 'images',
  },
  {
    title: 'Params Explorer',
    description:
      'Params explorer enables a parallel coordinates view for metrics and params. Very helpful when doing hyperparameter search.',
    path: 'params',
    icon: 'params',
  },
  {
    title: 'Scatters Explorer',
    description:
      'Scatter explorer helps to explore and learn relationship, correlations, and clustering effects between metrics and parameters.',
    path: 'scatters',
    icon: 'scatterplot',
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
