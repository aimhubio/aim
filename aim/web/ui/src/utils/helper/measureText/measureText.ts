// Handy JavaScript to measure the size taken to render the supplied text;
// you can supply additional style information too if you have it.

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
}) {
  context.font = `${fontWeight} ${fontSize} ${fontFamily}`;
  const result = context.measureText(text);
  return result;
}

export default measureText;
