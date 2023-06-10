import humanizeDuration from 'humanize-duration';

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'year',
      mo: () => 'mon',
      w: () => 'week',
      d: () => 'day',
      h: () => 'hrs',
      m: () => 'min',
      s: () => 'sec',
      ms: () => 'ms',
    },
  },
  units: ['d', 'h', 'm', 's', 'ms'],
  spacer: '',
  delimiter: ' ',
  largest: 2,
});

export default shortEnglishHumanizer;
