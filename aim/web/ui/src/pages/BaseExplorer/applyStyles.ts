function applyVisualizationProperties(objectList: any, modifierConfig: any) {
  const width = 100;
  const height = 100;

  const modifierVisuals = [...modifierConfig].filter(
    (item, index) => index % 2 !== 0,
  );

  return objectList.map((item: any) => ({
    ...item,
    visuals: {
      x: item.order * width,
      y: modifierVisuals.indexOf(item.groupKey) * height,
      width,
      height,
    },
  }));
}

export default applyVisualizationProperties;
