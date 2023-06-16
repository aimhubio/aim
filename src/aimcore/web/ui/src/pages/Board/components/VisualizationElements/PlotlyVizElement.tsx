import * as React from 'react';

import Plotly from '../Plotly';

function PlotlyVizElement(props: any) {
  return (
    <div className='VizComponentContainer' style={{ minHeight: 400 }}>
      <Plotly {...props} />
    </div>
  );
}

export default PlotlyVizElement;
