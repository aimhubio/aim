// Adapted from ansi-to-html by Rob Burns
// License: https://github.com/rburns/ansi-to-html/blob/master/LICENSE-MIT.txt
import _ from 'lodash-es';

interface Options {
  /** The default foreground color used when reset color codes are encountered. */
  fg?: string;
  /** The default background color used when reset color codes are encountered. */
  bg?: string;
  /** Convert newline characters to `<br/>`. */
  newline?: boolean;
  /** Can override specific colors or the entire ANSI palette. */
  colors?: string[] | { [code: number]: string };
}

type Stack = string[];

const defaults: Options = {
  fg: '#FFF',
  bg: '#000',
  newline: false,
  colors: getDefaultColors(),
};

function getDefaultColors(): Record<string, string> {
  const colors: Record<string, string> = {
    0: '#000',
    1: '#A00',
    2: '#0A0',
    3: '#A50',
    4: '#00A',
    5: '#A0A',
    6: '#0AA',
    7: '#AAA',
    8: '#555',
    9: '#F55',
    10: '#5F5',
    11: '#FF5',
    12: '#55F',
    13: '#F5F',
    14: '#5FF',
    15: '#FFF',
  };

  _.range(0, 6).forEach((red: number) => {
    _.range(0, 6).forEach((green: number) => {
      _.range(0, 6).forEach((blue: number) =>
        setStyleColor(red, green, blue, colors),
      );
    });
  });

  _.range(0, 24).forEach((gray: number) => {
    const c = gray + 232;
    const l = toHexString(gray * 10 + 8);

    colors[c] = '#' + l + l + l;
  });

  return colors;
}

/**
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @param {Record<string, string>} colors
 */
function setStyleColor(
  red: number,
  green: number,
  blue: number,
  colors: Record<string, string>,
): void {
  const c = 16 + red * 36 + green * 6 + blue;
  const r = red > 0 ? red * 40 + 55 : 0;
  const g = green > 0 ? green * 40 + 55 : 0;
  const b = blue > 0 ? blue * 40 + 55 : 0;

  colors[c] = toColorHexString([r, g, b]);
}

/**
 * Converts from a number like 15 to a hex string like 'F'
 * @param {number} num
 * @returns {string}
 */
function toHexString(num: number): string {
  let str = num.toString(16);

  while (str.length < 2) {
    str = '0' + str;
  }

  return str;
}

/**
 * Converts from an array of numbers like [15, 15, 15] to a hex string like 'FFF'
 * @param {[red, green, blue]} ref
 * @returns {string}
 */
function toColorHexString(ref: number[]): string {
  const results = [];

  for (const r of ref) {
    results.push(toHexString(r));
  }

  return '#' + results.join('');
}

/**
 * @param {Stack} stack
 * @param {string} token
 * @param {string} data
 * @param {Options} options
 */
function generateOutput(
  stack: Stack,
  token: string,
  data: string,
  options: Options,
) {
  let result;
  if (token === 'text') {
    result = data;
  } else if (token === 'display') {
    result = handleDisplay(stack, +data, options);
  } else if (token === 'xterm256Foreground') {
    result = pushForegroundColor(stack, options?.colors?.[+data] as string);
  } else if (token === 'xterm256Background') {
    result = pushBackgroundColor(stack, options?.colors?.[+data] as string);
  } else if (token === 'rgb') {
    result = handleRgb(stack, data);
  }

  return result;
}

/**
 * @param {Stack} stack
 * @param {string} data
 * @returns {string}
 */
function handleRgb(stack: Stack, data: string): string {
  data = data.substring(2).slice(0, -1);
  const operation = +data.substr(0, 2);

  const color = data.substring(5).split(';');
  const rgb = color
    .map(function (value) {
      return ('0' + Number(value).toString(16)).substring(-2);
    })
    .join('');

  return pushStyle(
    stack,
    (operation === 38 ? 'color:#' : 'background-color:#') + rgb,
  );
}

/**
 * @param {Stack} stack
 * @param {string} code
 * @param {Options} options
 * @returns {string | number | void }
 */
function handleDisplay(
  stack: Stack,
  code: number,
  options: Options,
): string | number | void {
  code = parseInt(`${code}`, 10);

  const codeMap: Record<string, () => void> = {
    '-1': () => '<br/>',
    0: () => stack.length && resetStyles(stack),
    1: () => pushTag(stack, 'b'),
    3: () => pushTag(stack, 'i'),
    4: () => pushTag(stack, 'u'),
    8: () => pushStyle(stack, 'display:none'),
    9: () => pushTag(stack, 'strike'),
    22: () =>
      pushStyle(
        stack,
        'font-weight:normal;text-decoration:none;font-style:normal',
      ),
    23: () => closeTag(stack, 'i'),
    24: () => closeTag(stack, 'u'),
    39: () => pushForegroundColor(stack, options.fg as string),
    49: () => pushBackgroundColor(stack, options.bg as string),
    53: () => pushStyle(stack, 'text-decoration:overline'),
  };

  if (codeMap[code]) {
    return codeMap[code]();
  } else if (4 < code && code < 7) {
    return pushTag(stack, 'blink');
  } else if (29 < code && code < 38) {
    return pushForegroundColor(stack, options?.colors?.[code - 30] as string);
  } else if (39 < code && code < 48) {
    return pushBackgroundColor(stack, options?.colors?.[code - 40] as string);
  } else if (89 < code && code < 98) {
    return pushForegroundColor(
      stack,
      options?.colors?.[8 + (code - 90)] as string,
    );
  } else if (99 < code && code < 108) {
    return pushBackgroundColor(
      stack,
      options?.colors?.[8 + (code - 100)] as string,
    );
  }
}

/**
 * Clear all the styles
 * @param {Stack} stack
 * @returns {string}
 */
function resetStyles(stack: Stack): string {
  const stackClone = stack.slice(0);

  stack.length = 0;

  return stackClone
    .reverse()
    .map(function (tag) {
      return '</' + tag + '>';
    })
    .join('');
}

/**
 * @param {Stack} stack
 * @param {string} tag
 * @param {string} [style='']
 * @returns {string}
 */
function pushTag(stack: Stack, tag: string, style?: string): string {
  if (!style) {
    style = '';
  }

  stack.push(tag);

  return `<${tag}${style ? ` style="${style}"` : ''}>`;
}

/**
 * @param {Stack} stack
 * @param {string} style
 * @returns {string}
 */
function pushStyle(stack: Stack, style: string): string {
  return pushTag(stack, 'span', style);
}

function pushForegroundColor(stack: Stack, color: string) {
  return pushTag(stack, 'span', 'color:' + color);
}

function pushBackgroundColor(stack: Stack, color: string) {
  return pushTag(stack, 'span', 'background-color:' + color);
}

/**
 * @param {Stack} stack
 * @param {string} style
 * @returns {string | undefined}
 */
function closeTag(stack: Stack, style: string): string | undefined {
  let last;

  if (stack.slice(-1)[0] === style) {
    last = stack.pop();
  }

  if (last) {
    return '</' + style + '>';
  }
}

/**
 * @param {string} text
 * @param {Options} options
 * @param {function} callback
 * @returns {Array}
 */
function tokenize(
  text: string,
  options: Options,
  callback: (token: string, data: string | number) => void,
) {
  let ansiMatch = false;
  const ansiHandler = 3;

  function remove() {
    return '';
  }

  function removeXterm256Foreground(z: string, g1: string) {
    callback('xterm256Foreground', g1);
    return '';
  }

  function removeXterm256Background(m: string, g1: string) {
    callback('xterm256Background', g1);
    return '';
  }

  function newline(m: string) {
    if (options.newline) {
      callback('display', -1);
    } else {
      callback('text', m);
    }

    return '';
  }

  function ansiMess(m: string, g1: string) {
    ansiMatch = true;
    if (g1.trim().length === 0) {
      g1 = '0';
    }

    const g2 = g1.trimRight().split(';');

    for (const g of g2) {
      callback('display', g);
    }

    return '';
  }

  function realText(m: string) {
    callback('text', m);

    return '';
  }

  function rgb(m: string) {
    callback('rgb', m);

    return '';
  }

  /* eslint no-control-regex:0 */
  const tokens = [
    {
      pattern: /^\x08+/,
      sub: remove,
    },
    {
      pattern: /^\x1b\[[012]?K/,
      sub: remove,
    },
    {
      pattern: /^\x1b\[\(B/,
      sub: remove,
    },
    {
      pattern: /^\x1b\[[34]8;2;\d+;\d+;\d+m/,
      sub: rgb,
    },
    {
      pattern: /^\x1b\[38;5;(\d+)m/,
      sub: removeXterm256Foreground,
    },
    {
      pattern: /^\x1b\[48;5;(\d+)m/,
      sub: removeXterm256Background,
    },
    {
      pattern: /^\n/,
      sub: newline,
    },
    {
      pattern: /^\r+\n/,
      sub: newline,
    },
    {
      pattern: /^\r/,
      sub: newline,
    },
    {
      pattern: /^\x1b\[((?:\d{1,3};?)+|)m/,
      sub: ansiMess,
    },
    {
      // CSI n J
      // ED - Erase in Display Clears part of the screen.
      // If n is 0 (or missing), clear from cursor to end of screen.
      // If n is 1, clear from cursor to beginning of the screen.
      // If n is 2, clear entire screen (and moves cursor to upper left on DOS ANSI.SYS).
      // If n is 3, clear entire screen and delete all lines saved in the scrollback buffer
      //   (this feature was added for xterm and is supported by other terminal applications).
      pattern: /^\x1b\[\d?J/,
      sub: remove,
    },
    {
      // CSI n ; m f
      // HVP - Horizontal Vertical Position Same as CUP
      pattern: /^\x1b\[\d{0,3};\d{0,3}f/,
      sub: remove,
    },
    {
      // catch-all for CSI sequences?
      pattern: /^\x1b\[?[\d;]{0,3}/,
      sub: remove,
    },
    {
      /**
       * extracts real text - not containing:
       * - `\x1b' - ESC - escape (Ascii 27)
       * - '\x08' - BS - backspace (Ascii 8)
       * - `\n` - Newline - linefeed (LF) (ascii 10)
       * - `\r` - Windows Carriage Return (CR)
       */
      pattern: /^(([^\x1b\x08\r\n])+)/,
      sub: realText,
    },
  ];

  function process(
    handler: {
      pattern: string | RegExp;
      sub: (m: string, g1: string) => string;
    },
    i: number,
  ) {
    if (i > ansiHandler && ansiMatch) {
      return;
    }

    ansiMatch = false;

    text = text.replace(handler.pattern, handler.sub);
  }

  const results1 = [];
  let { length } = text;

  outer: while (length > 0) {
    for (let i = 0, o = 0, len = tokens.length; o < len; i = ++o) {
      const handler = tokens[i];
      process(handler, i);

      if (text.length !== length) {
        // We matched a token and removed it from the text. We need to
        // start matching *all* tokens against the new text.
        length = text.length;
        continue outer;
      }
    }

    if (text.length === length) {
      break;
    }
    results1.push(0);

    length = text.length;
  }

  return results1;
}

const formatAnsiToHtml = function (
  input: string | string[],
  options?: Options,
) {
  input = typeof input === 'string' ? [input] : input;

  let optionsA: Options = Object.assign({}, defaults, options);
  let stack: Stack = [];
  const buf = [];

  tokenize(input.join(''), optionsA, (token: string, data: string | number) => {
    const output = generateOutput(stack, token, `${data}`, optionsA);

    if (output) {
      buf.push(output);
    }
  });

  if (stack.length) {
    buf.push(resetStyles(stack));
  }
  return buf.join('');
};

export default formatAnsiToHtml;
