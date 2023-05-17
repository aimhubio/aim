import * as React from 'react';

import Plotly from '../Plotly';

function PlotlyVizElement(props: any) {
  return (
    <div className='VizComponentContainer'>
      <Plotly {...props} />
    </div>
  );
}

export default PlotlyVizElement;
