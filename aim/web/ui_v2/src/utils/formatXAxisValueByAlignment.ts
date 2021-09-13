import moment from 'moment';
import { AlignmentOptions } from 'config/alignment/alignmentOptions';
import shortEnglishHumanizer from 'utils/shortEnglishHumanizer';

function formatXAxisValueByAlignment({
  xAxisTickValue,
  type,
  humanizerConfig = {},
}: {
  xAxisTickValue: number | null;
  type?: AlignmentOptions;
  humanizerConfig?: {};
}) {
  let formattedXAxisValue;
  if (xAxisTickValue || xAxisTickValue === 0) {
    switch (type) {
      case AlignmentOptions.RELATIVE_TIME:
        formattedXAxisValue = shortEnglishHumanizer(
          Math.round(xAxisTickValue * 1000),
          {
            ...humanizerConfig,
            maxDecimalPoints: 2,
          },
        );
        break;
      case AlignmentOptions.ABSOLUTE_TIME:
        formattedXAxisValue =
          moment(xAxisTickValue).format('HH:mm:ss D MMM, YY');
        break;
      default:
        formattedXAxisValue = xAxisTickValue;
    }
  }

  return formattedXAxisValue ?? '--';
}

export default formatXAxisValueByAlignment;
