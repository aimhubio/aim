function shortenRunPropLabel(
  text: string,
  textWidth: number = 0,
  charSize: number = 6,
) {
  const maxChars = textWidth / charSize;
  const splitVal = text.split('.');
  let isFits = true;

  if (splitVal.length > 2) {
    isFits = maxChars >= text.length;
  }
  return {
    shortenValue: isFits
      ? text
      : `${splitVal[0]}.~.${splitVal[splitVal.length - 1]}`,
    isFits,
  };
}

export default shortenRunPropLabel;
