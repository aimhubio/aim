function objectToString(
  obj: { [key: string]: string | number },
  mode: string = 'axesLabel',
) {
  return Object.keys(obj)
    .map((key) => {
      switch (mode) {
        case 'keyHush':
          return `${key}-${obj[key]}`;
        default:
          return `${key}="${obj[key]}"`;
      }
    })
    .join(mode === 'keyHush' ? '' : ' ');
}

export default objectToString;
