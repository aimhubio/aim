function getMinAndMaxBetweenArrays(compArr: number[], arr?: number[]) {
  if (!arr && !compArr) {
    return [];
  }

  let resultArr = [];
  if (!compArr) {
    return arr;
  }
  if (arr) {
    resultArr[0] = arr[0] < compArr[0] ? compArr[0] : arr[0];
    resultArr[1] = arr[1] > compArr[1] ? compArr[1] : arr[1];
  } else {
    resultArr = compArr;
  }
  return resultArr;
}

export default getMinAndMaxBetweenArrays;
