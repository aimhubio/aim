import React from 'react';

import CodeBlock from '../CodeBlock/CodeBlock';

import './SetupGuide.scss';

function SetupGuide(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='SetupGuide__container'>
      <h2>Quick setup</h2>
      <div className='SetupGuide__code'>
        <h3>1. Installation</h3>
        <CodeBlock rowList={['pip install aim']} />
      </div>
      <div className='SetupGuide__code'>
        <h3>2. Import Aim</h3>
        <CodeBlock rowList={['import aim']} />
      </div>
      <div className='SetupGuide__code'>
        <h3>3. Track Experiment</h3>
        <CodeBlock
          rowList={[
            'r = aim.Run(experiment=”my_exp_name”)',
            'r.track(value, name=”loss”, subset=”train”)',
            'r[“hparams”] = “foo”',
          ]}
        />
      </div>
      <div className='StyleGuide__resources__container'>
        <div className='SetupGuide__resource__item'>
          <div className='StyleGuide__resource__item__icon'>
            <i className='icon-runs' />
          </div>
          <span>Full docs</span>
        </div>
        <div className='SetupGuide__resource__item'>
          <div className='StyleGuide__resource__item__icon'>
            <i className='icon-bookmarks' />
          </div>
          <span>Jupyter notebook</span>
        </div>
        <div className='SetupGuide__resource__item'>
          <div className='StyleGuide__resource__item__icon'>
            <i className='icon-metrics' />
          </div>
          <span>Live demo</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SetupGuide);
