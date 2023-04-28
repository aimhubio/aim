import React from 'react';

const LineChartVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "LineChart" */ './LineChartVizElement'
    ),
);
const DataFrameVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "DataFrame" */ './DataFrameVizElement'
    ),
);
const FiguresVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Figures" */ './FiguresVizElement'
    ),
);
const AudiosVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Audios" */ './AudiosVizElement'
    ),
);
const ImagesVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Images" */ './ImagesVizElement'
    ),
);
const TextsVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Texts" */ './TextsVizElement'
    ),
);
const JSONVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "JSON" */ './JSONVizElement'
    ),
);
const HTMLVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "HTML" */ './HTMLVizElement'
    ),
);
const TextVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Text" */ './TextVizElement'
    ),
);
const SelectVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Select" */ './SelectVizElement'
    ),
);
const RunMessagesVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "RunMessages" */ './RunMessagesVizElement'
    ),
);
const RunNotesVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "RunNotes" */ './RunNotesVizElement'
    ),
);
const PlotlyVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Plotly" */ './PlotlyVizElement'
    ),
);
const SliderVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Slider" */ './SliderVizElement'
    ),
);
const TextInputVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "TextInput" */ './TextInputVizElement'
    ),
);
const ButtonVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Button" */ './ButtonVizElement'
    ),
);
const SwitchVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Switch" */ './SwitchVizElement'
    ),
);
const TextAreaVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "TextArea" */ './TextAreaVizElement'
    ),
);

export type VizElementKey =
  | 'LineChart'
  | 'DataFrame'
  | 'Figures'
  | 'Audios'
  | 'Images'
  | 'Texts'
  | 'JSON'
  | 'HTML'
  | 'Text'
  | 'Select'
  | 'RunMessages'
  | 'RunNotes'
  | 'Plotly'
  | 'Slider'
  | 'TextInput'
  | 'Button'
  | 'Switch'
  | 'TextArea';

const VizElementsMap: Record<VizElementKey, React.FunctionComponent<any>> = {
  LineChart: LineChartVizElement,
  DataFrame: DataFrameVizElement,
  Figures: FiguresVizElement,
  Audios: AudiosVizElement,
  Images: ImagesVizElement,
  Texts: TextsVizElement,
  JSON: JSONVizElement,
  HTML: HTMLVizElement,
  Text: TextVizElement,
  Select: SelectVizElement,
  RunMessages: RunMessagesVizElement,
  RunNotes: RunNotesVizElement,
  Plotly: PlotlyVizElement,
  Slider: SliderVizElement,
  TextInput: TextInputVizElement,
  Button: ButtonVizElement,
  Switch: SwitchVizElement,
  TextArea: TextAreaVizElement,
};

export default VizElementsMap;
