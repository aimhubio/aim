import { useState, useLayoutEffect } from 'react';
import _ from 'lodash';

export function classNames() {
  let result = [];

  [].concat(Array.prototype.slice.call(arguments)).forEach(function (item) {
    if (!item) {
      return;
    }
    switch (typeof item === 'undefined' ? 'undefined' : typeof item) {
      case 'string':
        result.push(item);
        break;
      case 'object':
        Object.keys(item).forEach(function (key) {
          if (item[key]) {
            result.push(key);
          }
        });
        break;
      default:
        result.push('' + item);
    }
  });

  return result.join(' ');
}

export function useWindowSize() {
  let [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    updateSize();

    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

export function sortOnKeys(dict) {
  const sorted = [];

  for (let key in dict) {
    sorted[sorted.length] = key;
  }
  sorted.sort();

  const tempDict = {};
  for (let i = 0; i < sorted.length; i++) {
    tempDict[sorted[i]] = dict[sorted[i]];
  }

  return tempDict;
}

export function buildUrl(pattern, { ...params }) {
  let url = pattern;
  for (let param in params) {
    let regex = new RegExp(':' + param, 'g');
    url = url.replace(regex, params[param]);
  }

  return url;
}

export function randomStr(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function formatSize(size) {
  let scaled = 0;
  let metric = '';

  if (size < 1024) {
    scaled = 1;
    metric = 'KB';
  } else if (size < 1024 * 1024) {
    scaled = size / 1024;
    metric = 'KB';
  } else if (size < 1024 * 1024 * 1024) {
    scaled = size / (1024 * 1024);
    metric = 'MB';
  } else if (size < Math.pow(1024, 4)) {
    scaled = size / Math.pow(1024, 3);
    metric = 'GB';
  }

  let ceilSize = Math.ceil(scaled * 100) / 100;
  return [ceilSize, metric];
}

export function formatDuration(durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor((durationInSeconds % 3600) % 60);

  return {
    hours,
    minutes,
    seconds,
  };
}

export function isDev() {
  return window.app?.env === 'dev';
}

export function getObjectValueByPath(obj, path) {
  if (path.indexOf('.')) {
    const subs = path.split('.');
    let ret = obj;
    for (let i = 0; i < subs.length; i++) {
      ret = ret[subs[i]];
      if (ret === undefined) {
        return ret;
      }
    }
    return ret;
  } else {
    return obj[path];
  }
}

function isObject(object) {
  return object != null && typeof object === 'object';
}

export function deepEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !deepEqual(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
}

export function objectsIntersection(o1, o2) {
  return Object.keys(o1)
    .concat(Object.keys(o2))
    .sort()
    .reduce(function (r, a, i, aa) {
      if (i && aa[i - 1] === a) {
        r.push(a);
      }
      return r;
    }, []);
}

export function arraysIntersection(a, b) {
  let t;
  if (b.length > a.length) {
    t = b;
    b = a;
    a = t;
  }
  return a.filter(function (e) {
    return b.indexOf(e) > -1;
  });
}

export function removeOutliers(values, t = 2) {
  values.sort((a, b) => a - b);

  while (true) {
    if (!values.length) {
      break;
    }
    if (values[0] === values[values.length - 1]) {
      break;
    }
    const q1 = values[Math.floor(values.length / 4)];
    const q3 = values[Math.ceil(values.length * (3 / 4))];
    // Inter-quartile range
    const iqr = q3 - q1;
    const mean = values.reduce((pv, cv) => pv + cv, 0) / values.length;
    const furthest =
      mean - values[0] > values[values.length - 1] - mean
        ? values[0]
        : values[values.length - 1];
    if (Math.abs(furthest - mean) > t * iqr) {
      values = values.filter((elem) => elem !== furthest);
    } else {
      break;
    }
  }
  return values;
}

export function randomString(length, chars) {
  let mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';

  let result = '';
  for (let i = length; i > 0; --i) {
    result += mask[Math.floor(Math.random() * mask.length)];
  }

  return result;
}

export function roundValue(v) {
  return v ? Math.round(v * 10e6) / 10e6 : 0;
}

export function formatValue(value, sepCaseForUndefined = true) {
  if (sepCaseForUndefined && value === undefined) {
    return '-';
  }
  if (value === null || value === undefined) {
    return 'None';
  }
  if (value === true) {
    return 'True';
  }
  if (value === false) {
    return 'False';
  }
  if (typeof value === 'number') {
    return value;
  }

  return JSON.stringify(value);
}

export function interpolateColors(values) {
  let filteredValues = values.filter((elem) => typeof elem === 'number');

  if (filteredValues.length === 0) {
    return;
  }

  let min = Math.min(...filteredValues);
  let max = Math.max(...filteredValues);

  if (min === max) {
    return {
      [min]: 'rgb(155, 233, 168)',
    };
  }

  let colorsByValue = {};

  let start = [155, 233, 168];
  let end = [33, 110, 57];

  function interpolateColor(color1, color2, factor) {
    let result = color1.slice();
    for (var i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
  }

  for (let val of filteredValues) {
    let factor = (val - min) / (max - min);
    colorsByValue[val] = `rgb(${interpolateColor(start, end, factor).join(
      ',',
    )})`;
  }

  return colorsByValue;
}

export const renderQueue = function (func) {
  let _queue = [], // Data to be rendered
    _rate = 1000, // Number of calls per frame
    _invalidate = function () {}, // Invalidate last render queue
    _clear = function () {}; // Clearing function

  let rq = function (data) {
    if (data) rq.data(data);
    _invalidate();
    _clear();
    rq.render();
  };

  rq.render = function () {
    let valid = true;
    _invalidate = rq.invalidate = function () {
      valid = false;
    };

    function doFrame() {
      if (!valid) return true;
      let chunk = _queue.splice(0, _rate);
      chunk.map(func);
      timer_frame(doFrame);
    }

    doFrame();
  };

  rq.data = function (data) {
    _invalidate();
    _queue = data.slice(0);
    return rq;
  };

  rq.add = function (data) {
    _queue = _queue.concat(data);
  };

  rq.rate = function (value) {
    if (!arguments.length) return _rate;
    _rate = value;
    return rq;
  };

  rq.remaining = function () {
    return _queue.length;
  };

  rq.clear = function (func) {
    if (!arguments.length) {
      _clear();
      return rq;
    }
    _clear = func;
    return rq;
  };

  rq.invalidate = _invalidate;

  let timer_frame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      setTimeout(callback, 17);
    };

  return rq;
};

export function flattenObject(ob, prefix = false, result = null) {
  result = result || {};

  // Preserve empty objects and arrays, they are lost otherwise
  if (typeof ob === 'object' && ob !== null && Object.keys(ob).length === 0) {
    result[prefix] = Array.isArray(ob) ? [] : {};
    return result;
  }

  prefix = prefix ? prefix + '.' : '';

  for (const i in ob) {
    if (Object.prototype.hasOwnProperty.call(ob, i)) {
      if (
        typeof ob[i] === 'object' &&
        ob[i] !== null &&
        !Array.isArray(ob[i])
      ) {
        // Recursion on deeper objects
        flattenObject(ob[i], prefix + i, result);
      } else {
        result[prefix + i] = ob[i];
      }
    }
  }
  return result;
}

export function transformNestedArrToObj(item) {
  // Transform {foo: ['bar', 'baz']} to {foo: {bar: true, baz: true}}
  Object.keys(item).forEach((i) => {
    if (Array.isArray(item[i])) {
      const d = {};
      item[i].forEach((v) => (d[v] = true));
      item[i] = d;
    } else if (typeof item[i] === 'object') {
      transformNestedArrToObj(item[i]);
    }
  });
}

export function excludeObjectPaths(item, paths) {
  Object.keys(item).forEach((i) => {
    let matchedPaths = [];
    paths?.forEach((p) => {
      if (p?.[0] === i) {
        if (item[i] === true && p.length === 1) {
          delete item[i];
        } else {
          matchedPaths.push(p.slice(1));
        }
      }
    });
    if (matchedPaths.length) {
      excludeObjectPaths(item[i], matchedPaths);
    }
  });
}

export function searchNestedObject(item, path, baseMatched = false) {
  Object.keys(item).forEach((i) => {
    if (
      i.toLocaleLowerCase() === path[0].toLocaleLowerCase() ||
      (path.length === 1 &&
        i.toLocaleLowerCase().startsWith(path[0].toLocaleLowerCase()))
    ) {
      if (path.length > 1) {
        searchNestedObject(item[i], path.slice(1), true);
      }
    } else if (!baseMatched && item[i] !== true) {
      searchNestedObject(item[i], path, false);
    } else {
      delete item[i];
    }
  });
}

export function removeObjectEmptyKeys(item) {
  if (item === true) {
    return false;
  } else if (Object.keys(item).length === 0) {
    return true;
  } else {
    Object.keys(item).forEach((i) => {
      if (removeObjectEmptyKeys(item[i])) {
        delete item[i];
      }
    });
    return Object.keys(item).length === 0;
  }
}

export function shiftDate(date, numDays) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
}

export function getCSSSelectorFromString(str) {
  // Make alphanumeric (removes all other characters)
  let selector = str.replace(/[^a-z0-9_\s-]/g, '_');
  // Clean up multiple dashes or whitespaces
  selector = selector.replace(/[\s-]+/g, ' ');
  // Convert whitespaces to underscore
  selector = selector.replace(/[\s]/g, '_');

  return selector;
}

export function getValuesMedian(values) {
  values.sort((a, b) => a - b);
  const length = values.length;
  if (length % 2 === 0) {
    return (values[length / 2] + values[length / 2 - 1]) / 2;
  }

  return values[(length - 1) / 2];
}

export function calculateExponentianlMovingAvergae(data, smoothFactor) {
  let smoothedData = [data[0]];
  for (let i = 1; i < data.length; i++) {
    smoothedData.push(
      smoothedData[i - 1] * smoothFactor + data[i] * (1 - smoothFactor),
    );
  }
  return smoothedData;
}

export function calculateCentralMovingAverage(data, smoothFactor) {
  let smoothedData = [];
  const len = data.length;
  let windowSize = (smoothFactor - 1) / 2;

  for (let i = 0; i < len; i++) {
    const start = i - windowSize;
    const end = i + windowSize + 1;
    const currentWindow = data.slice(
      start < 0 ? 0 : start,
      end > len + 1 ? len + 1 : end,
    );
    const windowAvergae = _.sum(currentWindow) / currentWindow.length;
    smoothedData.push(windowAvergae);
  }

  return smoothedData;
}

export function rightStrip(str, remove) {
  if (!remove.length) {
    return str;
  }

  while (str.length > 0 && str.substr(str.length - remove.length) === remove) {
    str = str.substr(0, str.length - remove.length);
  }
  return str;
}

export function appendBuffer(buffer1, buffer2) {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp;
}

export function formatSystemMetricName(metric) {
  let name = metric;

  switch (name) {
    case '__system__cpu':
      name = 'CPU (%)';
      break;
    case '__system__p_memory_percent':
      name = 'Process Memory (%)';
      break;
    case '__system__memory_percent':
      name = 'Memory (%)';
      break;
    case '__system__disk_percent':
      name = 'Disk (%)';
      break;
    case '__system__gpu':
      name = 'GPU (%)';
      break;
    case '__system__gpu_memory_percent':
      name = 'GPU Memory (%)';
      break;
    case '__system__gpu_power_watts':
      name = 'GPU Power (W)';
      break;
    case '__system__gpu_temp':
      name = 'GPU Temp (°C)';
      break;
  }

  return name;
}

export function findClosestIndex(arr, element) {
  let minDiff = Infinity;
  let result = 0;
  for (let i = 0; i < arr.length; i++) {
    let diff = Math.abs(element - arr[i]);
    if (minDiff > diff) {
      minDiff = diff;
      result = i;
    }
  }
  return result;
}

export function JSONToCSV(objArray) {
  const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
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
