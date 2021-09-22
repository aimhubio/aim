function JsonToCSV(objArray: { [key: string]: string }[] | string): string {
  // If the `objArray` is stringified array we need to parse to regular array
  const array = Array.isArray(objArray) ? objArray : JSON.parse(objArray);
  let str = '';
  let line = '';
  // header
  for (let index in array[0]) {
    let value = index + '';
    line += '"' + value.replace(/"/g, '""') + '",';
  }
  line = line.slice(0, -1);
  str += line + '\r\n';

  // data
  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (let index in array[i]) {
      const value = array[i][index] + '';
      line += '"' + value.replace(/"/g, '""') + '",';
    }
    line = line.slice(0, -1);
    str += line + '\r\n';
  }
  return str;
}

export default JsonToCSV;
