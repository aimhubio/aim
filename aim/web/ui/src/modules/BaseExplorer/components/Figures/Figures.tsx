import React from 'react';
import Plot from 'react-plotly.js';

function Figures(props: any) {
  let [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    let timerID = setTimeout(() => {
      setData(JSON.parse(props.data.data.data));
    }, 250);

    return () => clearTimeout(timerID);
  }, [props.data.data.data]);

  return (
    data && (
      <Plot
        data={data.data}
        layout={data.layout}
        frames={data.frames}
        useResizeHandler={true}
      />
    )
  );
}

export default React.memo(Figures);
