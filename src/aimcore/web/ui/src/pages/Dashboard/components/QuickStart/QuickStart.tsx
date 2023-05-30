import * as React from 'react';

import { Link } from '@material-ui/core';

import { Text } from 'components/kit';
import CodeBlock from 'components/CodeBlock/CodeBlock';

import { DOCUMENTATIONS } from 'config/references';

import './QuickStart.scss';

function QuickStart() {
  return (
    <div className='QuickStart'>
      <Text
        tint={100}
        weight={600}
        size={18}
        className='Dashboard__middle__title'
      >
        Quick Start
      </Text>
      <div className='QuickStart__section'>
        <Text
          component='h3'
          size={14}
          weight={700}
          tint={100}
          className='QuickStart__section__title'
        >
          Integrate Aim with your code
        </Text>
        <CodeBlock
          code={`from aim import Run

# Initialize a new run
run = Run()

# Log run parameters
run["hparams"] = {
    "learning_rate": 0.001,
    "batch_size": 32
}

# Log metrics
for i in range(10):
    run.track(i, name='loss', step=i, context={ "subset":"train" })
    run.track(i, name='acc', step=i, context={ "subset":"train" })`}
        />
        <Text
          component='p'
          size={14}
          weight={500}
          tint={100}
          className='QuickStart__section__text'
        >
          See the full list of supported trackable objects(e.g. images, text,
          etc){' '}
          <Link
            target='_blank'
            href={DOCUMENTATIONS.SUPPORTED_TYPES}
            rel='noreferrer'
            className='QuickStart__section__text__link'
          >
            here
          </Link>
          .
        </Text>
      </div>
    </div>
  );
}

export default QuickStart;
