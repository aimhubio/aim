export const RENDER_LINES_OPTIMIZED_LIMIT = 100;

export const GRID_SIZE = {
  S: 4,
  M: 6,
  L: 12,
};

const { S, M, L } = GRID_SIZE;
// Chart grid pattern based on a 12-column grid layout
export const CHART_GRID_PATTERN: { [key: number]: number[] } = {
  1: [L],
  2: [M, M],
  3: [S, S, S],
  4: [M, M, M, M],
  5: [S, S, S, M, M],
  6: [S, S, S, S, S, S],
  7: [S, S, S, M, M, M, M],
  8: [S, S, S, S, S, S, M, M],
  9: [S, S, S, S, S, S, S, S, S],
};
