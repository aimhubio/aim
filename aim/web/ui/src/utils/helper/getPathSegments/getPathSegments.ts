/**
 * Get segments from path,
 * Usage
 *    getPathSegments(path)
 * @param {string} path - full path to object property
 * @return {string[]} parts - segments of path
 */

// TODO add test for this helper function
function getPathSegments(path: string): string[] {
  if (typeof path !== 'string') return [];
  const parts = [];
  const pathArray = path.split('.');

  for (let i = 0; i < pathArray.length; i++) {
    let p = pathArray[i];

    while (p[p.length - 1] === '\\' && pathArray[i + 1] !== undefined) {
      p = p.slice(0, -1) + '.';
      p += pathArray[++i];
    }

    parts.push(p);
  }

  return parts;
}

export default getPathSegments;
