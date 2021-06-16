import './BarExport.less';

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import UI from '../../../../../ui';

function BarExport(props) {
  const onBarExport = useCallback(() => {
    if (typeof props.exportData === 'function') {
      props.exportData();
    }
  }, [props.exportData]);

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
  exportData: PropTypes.func.isRequired,
};

export default React.memo(BarExport);
