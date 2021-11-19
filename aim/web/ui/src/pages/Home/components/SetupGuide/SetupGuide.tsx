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
            href='https://colab.research.google.com/drive/1Kq3-6x0dd7gAVCsiaClJf1TfKnW-d64f?usp=sharing'
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
            href='http://play.aimstack.io:10001/metrics?grouping=2KhRameHik98oBj8Bsw6VRdcA7KuW5Y2kZtNEFLDLRtdSb1RVR7k9p9QkRk9Tvai2qWdRFPzisMBiA5RNazdhRaE56LwugevHBFTsESJULie39yCghtVnq5CuWSA2B8MuPn3Dg6XRqVrsC7BpJE16jRKnZ7dZ7xonbkXiAM2TPL3YRByWYrre6J3hUPB7BdfUJz57sdPjnF3G72SbQUGEWXKZQKHNyQCjEkPbKNxQUKxh7wXeMB3PF1gqjGtGSEihL5LsT7jmnPBr5Mfr4dHp2mbUGSt8cQNydQhC1iPW53jXnZ77TdSnoHjGT1xLuSTyUzhLBpaPPMokZPV7cmi2FybEGWmVd53athLrBmuVx8PffZCpUoXUDbwZS4fzrgp9HBZhsfUunmJzqADxg3SxYny4k2dLoVer3ULiBzXExPkXaNsRaiJbM8ZTXsPVfVZbgCR1zyBHSogayxSZBdqdVD8rY5K&chart=Cm6b4V1xjN1vWwfnKhWBAJ491MNYk6oJHwWJtyKVe6zu6D7ShYbPyEyVuVgyn73j7KNbhSnhLnU6evCrpnHa338r8cXeEYtgUoNhxxBbYuVdUXqAox1334Uzc59hFxtbDfeL2MtZVh2JoLqiyEjnSqeqX6FWbWKAF61ivoFdkutMnDyhKCT9SoZYgLr9y1wR8CssfX2rwN4JUWT8k2Jr84WJ1vpAhrcB3xERKF3rAddQsczC1wE7824Qk3WVKAttLTLG5FVidFh9XkTD4Sdzf7DZ1DYoqiHs9zBFM2LASd7rz42fkmmrrz7koHoFQG6787QLuGBRDZTvYvCT8JeLbXpTdLtKXbvU3dboKqdbv7u9FvsCc7ir1SQeignKE7EKihcFSXf97QKLNXxNPdeyiwdGuj8Cj4kHfYwqRGUcjxMSihV45Y7F3x2W8zUvKB6uJLEnpDAufhcN7mLbzrjNRQ5mfW2GfgoJ5a6nrhzcUMbkztokkKpgokm2tZ23XWfyEq6WMxRxdXCrBMeuE5EgbfeResip87GcxW5o784gfG8xRaGdS596sQhLfgT4FPzytUqyHXU4upwfb65jGrUzG1dsiaiB1rZyXKpw6riKLCNNvRXVTnzRenQpyHzJBqDccyMSehy8T4ThFSjniSvsk1jKbsVgq2rA3RMyLJf9Z85cpx3hx7RmrJTCNv2aZtb3xXH3bEBms9u2XVCrykVsrSSRP4Tv3vjsbuMDdpAy5RscUCqPgFhJdHzTEaZGTzVL214rRWNum5RBgpcdK3QGtVWwAPXV2jirEpoUhqFEv4gTKX3KXL6LUPsi7jYPGNbMWAcovt3fTgVCrWZeaHRcSG3WKJX5La2vkjnDmhHNs4SbDjS6ze31iaz2fCwzSZ9v3ca4pVtWezPbHpBZVpZd4FG4Lt3oKDG2xvKP9w1Q1jP77hM4eozJxTFiTgQxH4S8mpnfYbxrnmVwxhAu4PKRmevEZkJPVX1hMN6yykqFz7RrhvG4yQ8muYEYWv5DkzycptNy9bDEmDxVAk2CRnvbdo6jYnWbh77t1JEZdhJoCaVSHk6MovrdLoc5X8jxEbcDU7xBL3wj5ecULt3tYq5aoFeNHHCTBxWnk2gA5iLZNA7rBNtQuEzBpN1kjh&select=7zY8Ghyd8kPXab3LdBmLqMwxSSWcZypz9sHYtcG8bSoniZPTnXp2oTf9TrxEu55XfP546wpJrzzEXCGpczGdS9z8coMktqf7j2EbUveJeLRBSPBPw83ru5MxhMSA3FysZ5nTiroEqNktj2ux67ExzjkheiJhWkf5oJNrKYEPuM8adYhjBH2Ez5Ma1uiNZfQxu1mt18iqX3DcFAc3BjjH3WXE3guqpk4bFzk16JB8Nz4pvhsuBDH6XUuGQsZEzoKRbbELYVMozcABWWn47w35XcT9YE4Bmyk8vuJuCY7wmN5wHxt8BiNAGoh9UQGcRqrWV55swMGy3v3Yfkfo9YSDZCEbs47gJ7kAbfLEGe4EPr2yv9h3mu5NuScU5fajDiGrt4oREeBK1SH3EqnPS8qznn4cumJccEBsPGzc88vQY3rHvyzD5LTrnmPxDUARm9HYeLq61nUJPjpUErEPwV37wiYzZrE8o3j8oVm4cwo1fczfffXjG7NkmqSVheZ'
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
