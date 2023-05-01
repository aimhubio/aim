/**
 * [Svg node element to serialized string](http://bl.ocks.org/Rokotyan/0556f8facbaf344507cdc45dc3622177)
 *
 * Usage: getSVGString(svgNode)
 *
 * @param {SVGSVGElement} svgNode a node element,
 * @returns {string} serialized svg by using XMLSerializer(https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer)
 */
function getSVGString(svgNode: SVGSVGElement): string {
  svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
  const cssStyleText = getCSSStyles(svgNode);
  appendCSS(cssStyleText, svgNode);

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgNode);
  svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
  svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix
  return svgString;
}

function getCSSStyles(parentElement: SVGSVGElement): string {
  const selectorTextArr = [];

  // Add Parent element Id and Classes to the list
  selectorTextArr.push('#' + parentElement.id);
  for (let c = 0; c < parentElement.classList.length; c++)
    if (!contains('.' + parentElement.classList[c], selectorTextArr))
      selectorTextArr.push('.' + parentElement.classList[c]);

  // Add Children element Ids and Classes to the list
  const nodes = parentElement.getElementsByTagName('*');
  for (let i = 0; i < nodes.length; i++) {
    const id = nodes[i].id;
    if (!contains('#' + id, selectorTextArr)) selectorTextArr.push('#' + id);

    const classes = nodes[i].classList;
    for (let c = 0; c < classes.length; c++)
      if (!contains('.' + classes[c], selectorTextArr))
        selectorTextArr.push('.' + classes[c]);
  }

  // Extract CSS Rules
  let extractedCSSText = '';
  for (let i = 0; i < document.styleSheets.length; i++) {
    const s = document.styleSheets[i];

    try {
      if (!s.cssRules) continue;
    } catch (e) {
      if (e.name !== 'SecurityError') throw e; // for Firefox
      continue;
    }

    const cssRules = s.cssRules;
    for (let r = 0; r < cssRules.length; r++) {
      if (contains((cssRules[r] as any).selectorText, selectorTextArr))
        extractedCSSText += cssRules[r].cssText;
    }
  }

  return extractedCSSText;

  function contains(str: string, arr: string[]) {
    return arr.indexOf(str) === -1 ? false : true;
  }
}

function appendCSS(cssText: string, element: SVGSVGElement): void {
  let styleElement = document.createElement('style');
  styleElement.setAttribute('type', 'text/css');
  styleElement.innerHTML = cssText;
  let refNode = element.hasChildNodes() ? element.children[0] : null;
  element.insertBefore(styleElement, refNode);
}

export default getSVGString;
