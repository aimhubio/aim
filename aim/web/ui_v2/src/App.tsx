import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

import SideBar from './components/SideBar/SideBar';

function App(): React.FunctionComponentElement<{}> {
  return (
    <BrowserRouter>
      <div className="App">
        <SideBar />
        <main>
          <React.Suspense fallback={null}>
            
          </React.Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
