function createSeriesModel(series: any) {
  return {
    ...series,
    data: Array.from(series.data.iterations).map((d: unknown, i: number) => [
      d,
      series.data.values[i],
    ]),
  };
}

export default createSeriesModel;
