import React from 'react';

const ParallelPlotVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "ParallelPlot" */ './ParallelPlotVizElement'
    ),
);

const LineChartVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "LineChart" */ './LineChartVizElement'
    ),
);

const NivoLineChartVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "NivoLineChart" */ './NivoLineChartVizElement'
    ),
);

const ScatterPlotVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "ScatterPlot" */ './ScatterPlotVizElement'
    ),
);

const BarChartVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "BarChart" */ './BarChartVizElement'
    ),
);

const DataFrameVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "DataFrame" */ './DataFrameVizElement'
    ),
);

const TableVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Table" */ './TableVizElement'
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
      /* webpackPrefetch: true, webpackChunkName: "Typography" */ './TextVizElement'
    ),
);

const CodeVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Code" */ './CodeVizElement'
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
const ExplorerVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "Explorer" */ './ExplorerVizElement'
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

const BoardVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "BoardEmbed" */ './BoardVizElement'
    ),
);
const BoardLinkVizElement = React.lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "BoardLink" */ './BoardLinkVizElement'
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
  | 'Code'
  | 'Radio'
  | 'Checkbox'
  | 'ToggleButton'
  | 'Explorer'
  | 'Header'
  | 'SubHeader'
  | 'Table'
  | 'Board'
  | 'BoardLink'
  | 'BarChart'
  | 'NivoLineChart'
  | 'ScatterPlot'
  | 'ParallelPlot';

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
  Table: TableVizElement,
  JSON: JSONVizElement,
  HTML: HTMLVizElement,
  Text: TextVizElement,
  Link: LinkVizElement,
  Header: TextVizElement,
  SubHeader: TextVizElement,
  Code: CodeVizElement,

  // Aim sequence viz components
  LineChart: LineChartVizElement,
  NivoLineChart: NivoLineChartVizElement,
  Figures: FiguresVizElement,
  Audios: AudiosVizElement,
  Images: ImagesVizElement,
  Texts: TextsVizElement,
  BarChart: BarChartVizElement,
  ScatterPlot: ScatterPlotVizElement,
  ParallelPlot: ParallelPlotVizElement,

  // Aim high level components
  RunMessages: RunMessagesVizElement,
  RunLogs: RunLogsVizElement,
  RunNotes: RunNotesVizElement,
  Explorer: ExplorerVizElement,

  // Board components
  Board: BoardVizElement,
  BoardLink: BoardLinkVizElement,
};

export default VizElementsMap;
