import React from 'react';

import CodeBlock from 'components/CodeBlock/CodeBlock';
import { Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { DOCUMENTATIONS, GUIDES, DEMOS } from 'config/references';

import { trackEvent } from 'services/analytics';

import { ISetupGuideProps } from 'types/pages/home/components/SetupGuide/SetupGuide';

import './SetupGuide.scss';

function SetupGuide({
  askEmailSent,
  onSendEmail,
}: ISetupGuideProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div className='SetupGuide__container'>
        <Text component='h2' size={24} weight={600} tint={100}>
          Integrate Aim with your code
        </Text>
        <div className='SetupGuide__code'>
          <Text component='h3' size={18} tint={100} weight={600}>
            1. Import Aim
          </Text>
          <CodeBlock code='import aim' />
        </div>
        <div className='SetupGuide__code'>
          <Text component='h3' size={18} tint={100} weight={600}>
            2. Track your training runs
          </Text>
          <CodeBlock
            code={`run_inst = aim.Run(experiment='my_exp_name')

# Save inputs, hparams or any other \`key: value\` pairs
run_inst['hparams'] = {
    'learning_rate': 0.01,
    'batch_size': 32,
}

# Track metrics
for i in range(10):
    run_inst.track(i, name='metric_name')`}
          />
        </div>
        <div className='SetupGuide__resources__container'>
          <a
            target='_blank'
            href={DOCUMENTATIONS.STABLE}
            rel='noreferrer'
            className='SetupGuide__resources__item'
            onClick={() => trackEvent(ANALYTICS_EVENT_KEYS.home.docs)}
          >
            <div className='SetupGuide__resources__item__icon'>
              <Icon
                className='SetupGuide__resources__item__icon_fullDocs'
                name='full-docs'
              />
            </div>
            <Text component='span' size={14} tint={100} weight={500}>
              Documentation
            </Text>
          </a>
          <div className='SetupGuide__resources__item'>
            <a
              target='_blank'
              href={GUIDES.SETUP.COLAB_EXAMPLE}
              rel='noreferrer'
              className='SetupGuide__resources__item'
              onClick={() => trackEvent(ANALYTICS_EVENT_KEYS.home.colab)}
            >
              <div className='SetupGuide__resources__item__icon'>
                <Icon
                  className='SetupGuide__resources__item__icon_co'
                  name='co'
                />
              </div>
              <Text component='span' size={14} tint={100} weight={500}>
                Colab notebook
              </Text>
            </a>
          </div>
          <div className='SetupGuide__resources__item'>
            <a
              target='_blank'
              href={DEMOS.MAIN}
              rel='noreferrer'
              className='SetupGuide__resources__item'
              onClick={() => trackEvent(ANALYTICS_EVENT_KEYS.home.liveDemo)}
            >
              <div className='SetupGuide__resources__item__icon'>
                <Icon
                  className='SetupGuide__resources__item__icon_liveDemo'
                  name='live-demo'
                />
              </div>
              <Text component='span' size={14} tint={100} weight={500}>
                Live demo
              </Text>
            </a>
          </div>
        </div>
        {/*{askEmailSent ? null : <AskForm onSendEmail={onSendEmail} />}*/}
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(SetupGuide);
