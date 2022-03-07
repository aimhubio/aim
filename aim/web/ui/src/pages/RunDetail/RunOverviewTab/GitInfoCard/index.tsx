import React from 'react';
import moment from 'moment';
import _ from 'lodash-es';

import { Text, Card, Icon } from 'components/kit';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { IGitInfoCardProps } from '../RunOverViewTab.d';

import './GitInfoCard.scss';

function GitInfoCard(props: IGitInfoCardProps) {
  return (
    <Card title='Git Info Card'>
      {_.isEmpty(props.data) ? (
        <IllustrationBlock size='large' title='No Results' />
      ) : (
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
              <Icon name='branch' fontSize={14} />
              <Text
                className='InfoCardValueText'
                weight={500}
                size={12}
                color='primary'
              >
                {props.data?.branch}
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
              <Icon name='avatar' fontSize={14} />
              <Text
                className='InfoCardValueText'
                weight={500}
                size={12}
                color='primary'
              >
                {props.data.commit?.author}
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
                {props.data.commit?.hash}
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
                {`${moment(props.data.commit?.timestamp).format(
                  'DD MMMM YYYY HH:MM A',
                )}`}
              </Text>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default React.memo(GitInfoCard);
