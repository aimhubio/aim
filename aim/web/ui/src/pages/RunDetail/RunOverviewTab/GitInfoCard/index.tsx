import React from 'react';

import { Text } from 'components/kit';

import { IGitInfoCardProps } from '../RunOvervewTab';

import './GitInfoCard.scss';

function GitInfoCard(props: IGitInfoCardProps) {
  return (
    <div className='GitInfoCard'>
      <Text className='Title' weight={600} size={18} tint={100} component='h3'>
        Git Information
      </Text>
      <div className='InfoSection flex fjb'>
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
          <div className='InfoCardLabelValue'>
            <Text
              className='InfoCardLabel'
              weight={500}
              tint={80}
              size={12}
              color='primary'
            >
              _final_branch_name_
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
          <div className='InfoCardLabelValue'>
            <Text
              className='InfoCardLabel'
              weight={500}
              tint={80}
              size={12}
              color='primary'
            >
              Adam Bittlingmayer
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
          <div className='InfoCardLabelValue'>
            <Text
              className='InfoCardLabel'
              weight={500}
              tint={80}
              size={12}
              color='primary'
            >
              426032ad2d7e4b0385bc6c51
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
          <div className='InfoCardLabelValue'>
            <Text
              className='InfoCardLabel'
              weight={500}
              tint={80}
              size={12}
              color='primary'
            >
              22:35:47 UTC+04:00
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(GitInfoCard);
