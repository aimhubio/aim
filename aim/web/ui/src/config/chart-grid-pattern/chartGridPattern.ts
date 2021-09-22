// Chart grid pattern based on a 12-column grid layout
const chartGridPattern: { [key: number]: number[] } = {
  1: [12],
  2: [6, 6],
  3: [4, 4, 4],
  4: [6, 6, 6, 6],
  5: [4, 4, 4, 6, 6],
  6: [4, 4, 4, 4, 4, 4],
  7: [4, 4, 4, 6, 6, 6, 6],
  8: [4, 4, 4, 4, 4, 4, 6, 6],
  9: [4, 4, 4, 4, 4, 4, 4, 4, 4],
};

export default chartGridPattern;
