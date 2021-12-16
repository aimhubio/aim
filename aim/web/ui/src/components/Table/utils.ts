// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';

export function renderElement(renderer, props) {
  if (React.isValidElement(renderer)) {
    if (!props) return renderer;
    return React.cloneElement(renderer, props);
  } else if (typeof renderer === 'function') {
    if (renderer.prototype && renderer.prototype.isReactComponent) {
      return React.createElement(renderer, props);
    } else if (renderer.defaultProps) {
      return renderer({ ...renderer.defaultProps, ...props });
    }
    return renderer(props);
  } else {
    return null;
  }
}

export function normalizeColumns(elements) {
  const columns = [];
  React.Children.forEach(elements, (element) => {
    if (React.isValidElement(element) && element.key) {
      const column = { ...element.props, key: element.key };
      columns.push(column);
    }
  });
  return columns;
}

export function isObjectEqual(objA, objB, ignoreFunction = true) {
  if (objA === objB) return true;
  if (objA === null && objB === null) return true;
  if (objA === null || objB === null) return false;
  if (typeof objA !== 'object' || typeof objB !== 'object') return false;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];

    if (key === '_owner' && objA.$$typeof) {
      // React-specific: avoid traversing React elements' _owner.
      //  _owner contains circular references
      // and is not needed when comparing the actual elements (and not their owners)
      continue;
    }

    const valueA = objA[key];
    const valueB = objB[key];
    const valueAType = typeof valueA;

    if (valueAType !== typeof valueB) return false;
    if (valueAType === 'function' && ignoreFunction) continue;
    if (valueAType === 'object') {
      if (!isObjectEqual(valueA, valueB, ignoreFunction)) return false;
      else continue;
    }
    if (valueA !== valueB) return false;
  }
  return true;
}

export function callOrReturn(funcOrValue, ...args) {
  return typeof funcOrValue === 'function' ? funcOrValue(...args) : funcOrValue;
}

export function hasChildren(data) {
  return Array.isArray(data.children) && data.children.length > 0;
}

export function unflatten(
  array,
  rootId = null,
  dataKey = 'id',
  parentKey = 'parentId',
) {
  const tree = [];
  const childrenMap = {};

  const length = array.length;
  for (let i = 0; i < length; i++) {
    const item = { ...array[i] };
    const id = item[dataKey];
    const parentId = item[parentKey];

    if (Array.isArray(item.children)) {
      childrenMap[id] = item.children.concat(childrenMap[id] || []);
    } else if (!childrenMap[id]) {
      childrenMap[id] = [];
    }
    item.children = childrenMap[id];

    if (parentId !== undefined && parentId !== rootId) {
      if (!childrenMap[parentId]) childrenMap[parentId] = [];
      childrenMap[parentId].push(item);
    } else {
      tree.push(item);
    }
  }

  return tree;
}

export function flattenOnKeys(tree, keys, depthMap = {}, dataKey = 'id') {
  if (!keys || !keys.length) return tree;

  const array = [];
  const keysSet = new Set();
  keys.forEach((x) => keysSet.add(x));

  let stack = [].concat(tree);
  stack.forEach((x) => (depthMap[x[dataKey]] = 0));
  while (stack.length > 0) {
    const item = stack.shift();

    array.push(item);
    if (
      keysSet.has(item[dataKey]) &&
      Array.isArray(item.children) &&
      item.children.length > 0
    ) {
      stack = [].concat(item.children, stack);
      item.children.forEach(
        (x) => (depthMap[x[dataKey]] = depthMap[item[dataKey]] + 1),
      );
    }
  }

  return array;
}

// Babel7 changed the behavior of @babel/plugin-transform-spread in https://github.com/babel/babel/pull/6763
// [...array] is transpiled to array.concat() while it was [].concat(array) before
// this change breaks immutable array(seamless-immutable), [...array] should always return mutable array
export function cloneArray(array) {
  if (!Array.isArray(array)) return [];
  return [].concat(array);
}

export function noop() {
  return null;
}

export function toString(value) {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return value.toString ? value.toString() : '';
}

// copied from https://www.30secondsofcode.org/js/s/debounce
export const debounce = (fn, ms = 0) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

// copied from https://www.30secondsofcode.org/js/s/throttle
export const throttle = (fn, wait) => {
  let inThrottle, lastFn, lastTime;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(this, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

// copied from https://github.com/react-bootstrap/dom-helpers
let scrollbarSize;
export function getScrollbarSize(recalculate) {
  if ((!scrollbarSize && scrollbarSize !== 0) || recalculate) {
    if (
      typeof window !== 'undefined' &&
      window.document &&
      window.document.createElement
    ) {
      const scrollDiv = document.createElement('div');

      scrollDiv.style.position = 'absolute';
      scrollDiv.style.top = '-9999px';
      scrollDiv.style.width = '50px';
      scrollDiv.style.height = '50px';
      scrollDiv.style.overflow = 'scroll';

      document.body.appendChild(scrollDiv);
      scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
    }
  }

  return scrollbarSize;
}

export function addClassName(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    if (!el.className.match(new RegExp(`(?:^|\\s)${className}(?!\\S)`))) {
      el.className += ` ${className}`;
    }
  }
}

export function removeClassName(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(
      new RegExp(`(?:^|\\s)${className}(?!\\S)`, 'g'),
      '',
    );
  }
}

export function getEstimatedTotalRowsHeight(data, estimatedRowHeight) {
  return typeof estimatedRowHeight === 'function'
    ? data.reduce(
        (height, rowData, rowIndex) =>
          height + estimatedRowHeight({ rowData, rowIndex }),
        0,
      )
    : data.length * estimatedRowHeight;
}
