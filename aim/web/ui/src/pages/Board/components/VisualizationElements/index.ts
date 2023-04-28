import React from 'react';

import LineChartVizElement from './LineChartVizElement';
import DataFrameVizElement from './DataFrameVizElement';
import FiguresVizElement from './FiguresVizElement';
import AudiosVizElement from './AudiosVizElement';
import ImagesVizElement from './ImagesVizElement';
import TextsVizElement from './TextsVizElement';
import JSONVizElement from './JSONVizElement';
import HTMLVizElement from './HTMLVizElement';
import TextVizElement from './TextVizElement';
import SelectVizElement from './SelectVizElement';
import RunMessagesVizElement from './RunMessagesVizElement';
import RunNotesVizElement from './RunNotesVizElement';
import PlotlyVizElement from './PlotlyVizElement';
import SliderVizElement from './SliderVizElement';
import TextInputVizElement from './TextInputVizElement';
import ButtonVizElement from './ButtonVizElement';
import SwitchVizElement from './SwitchVizElement';
import TextAreaVizElement from './TextAreaVizElement';

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
