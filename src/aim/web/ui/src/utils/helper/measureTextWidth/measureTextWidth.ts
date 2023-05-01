/**
 * [Measure text width]
 * measure the size taken to render the supplied text
 * you can supply additional style information too if you have it
 *
 * Usage: measureTextWidth({ text, fontSize, fontFamily, fontWeight })
 *
 * @param {string} text which size needs to measure,
 * @param {string} fontSize font size of the measured text,
 * @param {string} fontFamily font family of the measured text,
 * @param {number} fontWeight font weight of the measured text,
 * @returns {number} represents the width of a piece of text in the canvas
 */
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

function measureTextWidth({
  text,
  fontSize = '16px',
  fontFamily = 'Inter, sans-serif',
  fontWeight = 400,
}: {
  text: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: number;
}): number {
  if (canvas && context) {
    context.font = `${fontWeight} ${fontSize} ${fontFamily}`;
    const textMetrics = context.measureText(text);
    return textMetrics?.width || 0;
  }
  return 0;
}

export default measureTextWidth;
