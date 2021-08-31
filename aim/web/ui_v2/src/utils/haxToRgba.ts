function hexToRgbA(hex: string, opacity: number) {
  let hexCode = hex?.substring(1).split('');
  if (hexCode.length === 3) {
    hexCode = [
      hexCode[0],
      hexCode[0],
      hexCode[1],
      hexCode[1],
      hexCode[2],
      hexCode[2],
    ];
  }
  const tmpHex = +('0x' + hexCode.join(''));
  return (
    'rgba(' +
      [(tmpHex >> 16) & 255, (tmpHex >> 8) & 255, tmpHex & 255].join(',') +
      ',' +
      opacity || 1 + ')'
  );
}

export default hexToRgbA;
