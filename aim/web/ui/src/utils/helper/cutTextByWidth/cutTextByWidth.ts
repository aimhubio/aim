import { measureText } from '../index';

function cutTextByWidth(
  text: string,
  width: number,
  fontSize: number = 16,
  recourseIndex: number = 0,
): string {
  const currentTextWidth = measureText(text, fontSize).width;
  if (recourseIndex === 0 && width > currentTextWidth) {
    return text;
  } else if (currentTextWidth > width) {
    return cutTextByWidth(text.slice(0, -1), width, fontSize, ++recourseIndex);
  }
  return text.slice(0, -3) + '...';
}

export default cutTextByWidth;
