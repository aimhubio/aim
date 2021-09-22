import humanizeDuration from 'humanize-duration';

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
  units: ['d', 'h', 'm', 's'],
  spacer: '',
  delimiter: ' ',
  largest: 1,
});

export default shortEnglishHumanizer;
