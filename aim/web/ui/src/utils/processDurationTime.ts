import moment from 'moment';

import shortEnglishHumanizer from './shortEnglishHumanizer';

export function processDurationTime(startTime: number, endTime: number) {
  const duration = moment(endTime).diff(moment(startTime));

  return shortEnglishHumanizer(duration, {
    maxDecimalPoints: 2,
  });
}
