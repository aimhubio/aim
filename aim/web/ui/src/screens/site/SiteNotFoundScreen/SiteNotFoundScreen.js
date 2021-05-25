import './SiteNotFoundScreen.less';

import React from 'react';
import { Helmet } from 'react-helmet';

import SiteWrapper from '../../../wrappers/site/SiteWrapper/SiteWrapper';
import UI from '../../../ui';

export default class SiteNotFoundScreen extends React.Component {
  render() {
    return (
      <SiteWrapper>
        <Helmet>
          <meta title='' content='' />
        </Helmet>

        <div className='SiteNotFoundScreen'>
          <UI.Container>
            <div className='SiteNotFoundScreen__heading'>
              <UI.Text size={1} type='primary' spacingTop center>
                404
              </UI.Text>
              <UI.Text size={4} type='grey-light' center>
                Error. Not Found
              </UI.Text>
            </div>
          </UI.Container>
        </div>
      </SiteWrapper>
    );
  }
}
