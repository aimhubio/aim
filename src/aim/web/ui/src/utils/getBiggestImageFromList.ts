export default function getBiggestImageFromList(list: Array<{}>) {
  let maxHeight = 0;
  let maxWidth = 0;
  list.forEach((item: any) => {
    if (maxHeight < item.height) {
      maxHeight = item.height;
      maxWidth = item.width;
    }
  });
  return { maxHeight, maxWidth };
}
