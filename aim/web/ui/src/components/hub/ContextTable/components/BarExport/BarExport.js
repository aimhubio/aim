import './BarExport.less';

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import UI from '../../../../../ui';
import * as analytics from '../../../../../services/analytics';

function BarExport(props) {
  const onBarExport = useCallback(() => {
    if (typeof props.barExportData === 'function') {
      props.barExportData();
      //TODO
      analytics.trackEvent('[Table] Export some data of table');
    }
  }, [props.barExportData]);

  return (
    <div className='ContextTableBar__item__wrapper'>
      <UI.Button
        className='BarExport__action'
        type='primary'
        size='tiny'
        // disabled={excludedFields.length === 0}
        onClick={onBarExport}
      >
        <UI.Icon i='file_download' scale={1.4} style={{ marginRight: 6 }} />
        Export CSV
      </UI.Button>
    </div>
  );
}

BarExport.propTypes = {
  barExportData: PropTypes.func.isRequired,
};

export default React.memo(BarExport);
