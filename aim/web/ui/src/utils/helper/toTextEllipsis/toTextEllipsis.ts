import { measureText } from 'utils/helper';

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
  const { width: currentTextWidth } = measureText({
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
