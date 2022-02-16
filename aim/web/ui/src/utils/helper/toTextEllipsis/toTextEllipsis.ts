import { measureTextWidth } from 'utils/helper';
/**
 * [Display the text by specified width]
 * Cut text and display ellipsis if text width is more than specified width
 *
 * Usage: toTextEllipsis({ text, width, fontSize, fontFamily, fontWeight })
 *
 * @param {string} text which needs to display by specified width,
 * @param {number} width maximum width of the text,
 * @param {string} fontSize font size of the measured text,
 * @param {string} fontFamily font family of the measured text,
 * @param {number} fontWeight font weight of the measured text,
 * @returns {string} ellipsis text
 */
function toTextEllipsis({
  text,
  width,
  fontSize = '16px',
  fontFamily = 'Inter, sans-serif',
  fontWeight = 400,
  recourseIndex = 0,
}: {
  text: string;
  width: number;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: number;
  recourseIndex?: number;
}): string {
  const currentTextWidth = measureTextWidth({
    text,
    fontSize,
    fontFamily,
    fontWeight,
  });

  if (recourseIndex === 0 && width > currentTextWidth) {
    return text;
  } else if (currentTextWidth > width) {
    return toTextEllipsis({
      text: text.slice(0, -1),
      width,
      fontSize,
      fontFamily,
      fontWeight,
      recourseIndex: ++recourseIndex,
    });
  }
  return text.slice(0, -3) + '...';
}

export default toTextEllipsis;
