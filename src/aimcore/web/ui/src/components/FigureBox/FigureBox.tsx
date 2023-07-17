import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary';

function FigureBox() {
  return (
    <ErrorBoundary>
      <div className='FiguresBox'></div>
    </ErrorBoundary>
  );
}

export default FigureBox;
