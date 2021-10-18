import React from 'react';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import { Icon, Text } from 'components/kit';
import AskForm from '../AskForm/AskForm';
import { ISetupGuideProps } from 'types/pages/home/components/SetupGuide/SetupGuide';

import './SetupGuide.scss';

function SetupGuide({
  askEmailSent,
  onSendEmail,
}: ISetupGuideProps): React.FunctionComponentElement<React.ReactNode> {
  return (
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
for step in range(10):
    run_inst.track(metric_value, name='metric_name', epoch=epoch_number)
`}
        />
      </div>
      <div className='SetupGuide__resources__container'>
        <a
          target='_blank'
          href='https://github.com/aimhubio/aim#overview'
          rel='noreferrer'
          className='SetupGuide__resources__item'
        >
          <div className='SetupGuide__resources__item__icon'>
            <Icon name='runs' />
          </div>
          <Text component='span' size={14} tint={100} weight={500}>
            Full docs
          </Text>
        </a>
        <div className='SetupGuide__resources__item'>
          <div className='SetupGuide__resources__item__icon'>
            <Icon name='bookmarks' />
          </div>
          <Text component='span' size={14} tint={100} weight={500}>
            Jupyter notebook
          </Text>
        </div>
        <div className='SetupGuide__resources__item'>
          <div className='SetupGuide__resources__item__icon'>
            <Icon name='metrics' />
          </div>
          <Text component='span' size={14} tint={100} weight={500}>
            Live demo
          </Text>
        </div>
      </div>
      {askEmailSent ? null : <AskForm onSendEmail={onSendEmail} />}
    </div>
  );
}

export default React.memo(SetupGuide);
