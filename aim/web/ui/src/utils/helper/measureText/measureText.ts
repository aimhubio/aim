/**
 * [Measure text]
 * measure the size taken to render the supplied text
 * you can supply additional style information too if you have it
 *
 * Usage: measureText({ text, fontSize, fontFamily, fontWeight })
 *
 * @param {string} text which size needs to measure,
 * @param {string} fontSize font size of the measured text,
 * @param {string} fontFamily font family of the measured text,
 * @param {number} fontWeight font weight of the measured text,
 * @returns {TextMetrics} represents the dimensions of a piece of text in the canvas
 */
const canvas = document.createElement('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

function measureText({
  text,
  fontSize = '16px',
  fontFamily = 'Inter, sans-serif',
  fontWeight = 400,
}: {
  text: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: number;
}): TextMetrics {
  context.font = `${fontWeight} ${fontSize} ${fontFamily}`;
  return context.measureText(text);
}

export default measureText;
