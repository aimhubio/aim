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
const RunLogsVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "RunLogs" */ './RunLogsVizElement'
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
const RangeSliderVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "RangeSlider" */ './RangeSliderVizElement'
    ),
);
const TextInputVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "TextInput" */ './TextInputVizElement'
    ),
);
const NumberInputVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "NumberInput" */ './NumberInputVizElement'
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
const RadioVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Radio" */ './RadioVizElement'
    ),
);
const LinkVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Link" */ './LinkVizElement'
    ),
);
const CheckboxVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Checkbox" */ './CheckboxVizElement'
    ),
);
const ToggleButtonVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "ToggleButton" */ './ToggleButtonVizElement'
    ),
);

const HeaderVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Header" */ './HeaderVizElement'
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
  | 'Link'
  | 'Select'
  | 'RunMessages'
  | 'RunLogs'
  | 'RunNotes'
  | 'Plotly'
  | 'Slider'
  | 'RangeSlider'
  | 'TextInput'
  | 'NumberInput'
  | 'Button'
  | 'Switch'
  | 'TextArea'
  | 'Radio'
  | 'Checkbox'
  | 'ToggleButton'
  | 'Header';

const VizElementsMap: Record<VizElementKey, React.FunctionComponent<any>> = {
  // input elements
  Button: ButtonVizElement,
  TextInput: TextInputVizElement,
  NumberInput: NumberInputVizElement,
  Switch: SwitchVizElement,
  TextArea: TextAreaVizElement,
  Slider: SliderVizElement,
  RangeSlider: RangeSliderVizElement,
  Select: SelectVizElement,
  Radio: RadioVizElement,
  Checkbox: CheckboxVizElement,
  ToggleButton: ToggleButtonVizElement,

  // data display elements
  Plotly: PlotlyVizElement,
  DataFrame: DataFrameVizElement,
  JSON: JSONVizElement,
  HTML: HTMLVizElement,
  Text: TextVizElement,
  Link: LinkVizElement,
  Header: HeaderVizElement,

  // Aim sequence viz components
  LineChart: LineChartVizElement,
  Figures: FiguresVizElement,
  Audios: AudiosVizElement,
  Images: ImagesVizElement,
  Texts: TextsVizElement,

  // Aim high level components
  RunMessages: RunMessagesVizElement,
  RunLogs: RunLogsVizElement,
  RunNotes: RunNotesVizElement,
};

export default VizElementsMap;
