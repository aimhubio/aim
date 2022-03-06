import React from 'react';

import { Text, Card, Icon } from 'components/kit';

import { IGitInfoCardProps } from '../RunOvervewTab';

import './GitInfoCard.scss';

function GitInfoCard(props: IGitInfoCardProps) {
  return (
    <Card title='Git Info Card'>
      <div className='InfoSection ScrollBar__hidden flex fjb'>
        <div className='InfoCard flex fdc'>
          <Text
            className='InfoCardLabel'
            weight={400}
            tint={50}
            size={12}
            color='primary'
          >
            Branch
          </Text>
          <div className='InfoCardValue flex fac'>
            <Icon name='hash' fontSize={14} />
            <Text
              className='InfoCardValueText'
              weight={500}
              size={12}
              color='primary'
            >
              {props.data.branch || '_final_branch_name_'}
            </Text>
          </div>
        </div>
        <div className='InfoCard flex fdc'>
          <Text
            className='InfoCardLabel'
            weight={400}
            tint={50}
            size={12}
            color='primary'
          >
            Author
          </Text>
          <div className='InfoCardValue flex fac'>
            <Icon name='hash' fontSize={14} />
            <Text
              className='InfoCardValueText'
              weight={500}
              size={12}
              color='primary'
            >
              {props.data.commit?.author || 'Adam Bittlingmayer'}
            </Text>
          </div>
        </div>
        <div className='InfoCard flex fdc'>
          <Text
            className='InfoCardLabel'
            weight={400}
            tint={50}
            size={12}
            color='primary'
          >
            Hash
          </Text>
          <div className='InfoCardValue flex fac'>
            <Icon name='hash' fontSize={14} />
            <Text
              className='InfoCardValueText'
              weight={500}
              size={12}
              color='primary'
            >
              {props.data.commit?.hash || '426032ad2d7e4b0385bc6c51'}
            </Text>
          </div>
        </div>
        <div className='InfoCard flex fdc'>
          <Text
            className='InfoCardLabel'
            weight={400}
            tint={50}
            size={12}
            color='primary'
          >
            Timestamp
          </Text>
          <div className='InfoCardValue flex fac'>
            <Icon name='time' fontSize={14} />
            <Text
              className='InfoCardValueText'
              weight={500}
              size={12}
              color='primary'
            >
              {props.data.commit?.timestamp || '19 February 2020'}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(GitInfoCard);
