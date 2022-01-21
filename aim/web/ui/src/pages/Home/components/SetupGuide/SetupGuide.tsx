import React from 'react';

import CodeBlock from 'components/CodeBlock/CodeBlock';
import { Icon, Text } from 'components/kit';

import { trackEvent } from 'services/analytics';

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
          href='https://aimstack.readthedocs.io/en/stable/'
          rel='noreferrer'
          className='SetupGuide__resources__item'
          onClick={() => trackEvent('[Homepage] go to documentation')}
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
            href='https://colab.research.google.com/drive/14rIAjpEyklf5fSMiRbyZs6iYG7IVibcI?usp=sharing'
            rel='noreferrer'
            className='SetupGuide__resources__item'
            onClick={() => trackEvent('[Homepage] go to colab notebook')}
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
            href='http://play.aimstack.io:10001/metrics?grouping=8uYPXatSfU5QSDNPAu7p86Uw438qTupoLaxzkERnqPAfSSDTAANjKUXKghaTQgcdkgJu1DgEg9A3X61eePdqmTtkqrEmHHDvuSLjG8C44X3FNd1fdgx7nEsAm3wiQBDg1gjmFdZfvaf4qmbqxC6fp92DnDnjfw6KN4fqG3dr6QKRbMhqk6ThR2rsbVHAoFofbmyc2DqH35ZRKFZiEEdgUFVov6zVEDkW8MVvBJgw36iEvwBNhDrGD9zozbJhm5uz4NNjXdvaikfTVXgmgYM7oHVeM28Ci63bykQSt372tiZ8hXSjMUUbr9ipXna19ivDKKYKDcBsih3STFRprR278pMw3cd9AypyxxyQoLgqLFYwVN94tURTNrtEyJPQeQWYfjtKfEx2fLEVHHvZSWjBFHCHeN4FGpFwBx6bzpJcpSphG66StebxKq8j4gX4RvpVgXoGXMua35yj3SuDhJ&chart=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&select=7zY8cjozbtZPcd218aSeA6iwCEGaLqsuegewPXMXmDAtEKdrvzLb3u4zxJTbtBqNCKiG8wY9gzhgqiMsGcEcU2gWnt4PxCiKoV4qj2M3LRUKiEt7aVgC1qPzxsq8njZjLTD5MTxtLS69ZnAA4D89GE9Ck5BkwbhMedCpKiZdmxHDQ8owyFkVBXWETwPEC1K2tsqWv8fbCqf9kxZTELr8dfT1SLhzfsxvdcG2dBdaVJhAZahhZfkPY1b5urf2yWW4ynKzxeHYejJqgWSNiUzXXJGNtCXbYUkJ59higJEQdcY1JriFymBepjpV1BvZmmy6u2SXa4DoLWrgYSdwL3hqELPpDe1xvv7YLFEitKqmsYwvqfeysgL3Hn9FRRbwTDDibGBNQgrg9XsLxqnuWhkKaVJ3J1hETKMcydbCTUqTqsKbvKmZwoREXkyivQf6H75Y3jYZx33JjzkFEb9ZYcUYHQSwF5kMKPQhwRRGkbGMCZYqtokK59adpSy565E'
            rel='noreferrer'
            className='SetupGuide__resources__item'
            onClick={() => trackEvent('[Homepage] go to live demo')}
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
  );
}

export default React.memo(SetupGuide);
