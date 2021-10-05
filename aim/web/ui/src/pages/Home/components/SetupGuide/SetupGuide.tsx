import React from 'react';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import Icon from 'components/Icon/Icon';

import './SetupGuide.scss';

function SetupGuide(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='SetupGuide__container'>
      <h2>Integrate Aim with your code</h2>
      <div className='SetupGuide__code'>
        <h3>1. Import Aim</h3>
        <CodeBlock code='import aim' />
      </div>
      <div className='SetupGuide__code'>
        <h3>2. Track your training runs</h3>
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
          <span>Full docs</span>
        </a>
        <div className='SetupGuide__resources__item'>
          <div className='SetupGuide__resources__item__icon'>
            <Icon name='bookmarks' />
          </div>
          <span>Jupyter notebook</span>
        </div>
        <div className='SetupGuide__resources__item'>
          <div className='SetupGuide__resources__item__icon'>
            <Icon name='metrics' />
          </div>
          <span>Live demo</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SetupGuide);
