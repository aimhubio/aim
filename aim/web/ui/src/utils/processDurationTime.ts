import moment from 'moment';

import shortEnglishHumanizer from './shortEnglishHumanizer';

export function processDurationTime(
  startTime: number,
  endTime: number,
): string {
  const duration = moment(startTime).diff(moment(endTime));

  return shortEnglishHumanizer(duration, {
    maxDecimalPoints: 2,
  });
}
