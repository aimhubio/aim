import moment from 'moment';

export function processDurationTime(startTime: number, endTime: number) {
  const duration = moment.duration(moment(endTime).diff(moment(startTime)));
  return `${duration.hours()}:${duration.minutes()}:${duration.seconds()}`;
}
