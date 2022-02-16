/**
 * [Download file]
 *
 * Usage: downloadLink(href, fileName)
 *
 * @param {string} href a link to file which needs to be downloaded,
 * @param {string} fileName a name of file which needs to be downloaded,
 * @returns {void}
 */
function downloadLink(href: string, fileName: string = 'file'): void {
  let link = document.createElement('a');
  link.download = fileName;
  link.style.opacity = '0';
  document.body.append(link);
  link.href = href;
  link.click();
  link.remove();
}

export default downloadLink;
